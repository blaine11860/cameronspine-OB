import { Server } from 'socket.io';
import { supabase } from './supabaseClient.js';
import { db } from './db.ts';
import { forumPosts, messages, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export function attachRealtime(server) {
  const io = new Server(server, { 
    cors: { origin: '*' },
    path: '/ws'
  });

  // Middleware to authenticate socket connections
  const authenticateSocket = async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      let userId = null;

      if (supabase && token) {
        // Supabase authentication
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
          return next(new Error('Authentication failed'));
        }
        userId = user.id;
      } else if (socket.handshake.auth.replitUserId) {
        // Replit authentication fallback
        userId = socket.handshake.auth.replitUserId;
      } else {
        return next(new Error('Authentication required'));
      }

      socket.userId = userId;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  };

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected to real-time services`);

    // Join user's personal room for direct messages
    socket.join(`user_${socket.userId}`);

    // Forum thread functionality
    socket.on('join-thread', (threadId) => {
      socket.join(`thread_${threadId}`);
      console.log(`User ${socket.userId} joined thread ${threadId}`);
    });

    socket.on('leave-thread', (threadId) => {
      socket.leave(`thread_${threadId}`);
      console.log(`User ${socket.userId} left thread ${threadId}`);
    });

    // Post a new reply to a forum thread
    socket.on('post-reply', async ({ threadId, content, isAnonymous = false }) => {
      try {
        let newPost;

        if (supabase) {
          // Use Supabase for database operations
          const { data, error } = await supabase
            .from('forum_posts')
            .insert({
              thread_id: threadId,
              user_id: socket.userId,
              content,
              is_anonymous: isAnonymous,
              created_at: new Date().toISOString(),
            })
            .select(`
              *,
              users!inner(first_name, last_name, is_clinician)
            `)
            .single();

          if (error) throw error;
          newPost = data;
        } else {
          // Use Drizzle ORM for Replit database
          const [post] = await db.insert(forumPosts).values({
            threadId,
            userId: socket.userId,
            content,
            isAnonymous,
            createdAt: new Date(),
          }).returning();

          // Fetch user info for the response
          const [user] = await db.select({
            firstName: users.firstName,
            lastName: users.lastName,
            isClinician: users.isClinician,
          })
            .from(users)
            .where(eq(users.id, socket.userId));

          newPost = {
            ...post,
            users: user
          };
        }

        // Broadcast the new post to all users in the thread
        io.to(`thread_${threadId}`).emit('new-reply', {
          id: newPost.id,
          content: newPost.content,
          isAnonymous: newPost.is_anonymous || newPost.isAnonymous,
          createdAt: newPost.created_at || newPost.createdAt,
          author: newPost.is_anonymous || newPost.isAnonymous ? null : {
            name: `${newPost.users.first_name || newPost.users.firstName} ${newPost.users.last_name || newPost.users.lastName}`,
            isClinician: newPost.users.is_clinician || newPost.users.isClinician
          }
        });

      } catch (error) {
        console.error('Error posting reply:', error);
        socket.emit('error', { message: 'Failed to post reply' });
      }
    });

    // Direct messaging functionality
    socket.on('send-message', async ({ toUserId, content, isEmergency = false }) => {
      try {
        let message;

        if (supabase) {
          // Use Supabase for database operations
          const { data, error } = await supabase
            .from('messages')
            .insert({
              from_user_id: socket.userId,
              to_user_id: toUserId,
              content,
              is_emergency: isEmergency,
              created_at: new Date().toISOString(),
            })
            .select(`
              *,
              from_user:users!from_user_id(first_name, last_name, is_clinician),
              to_user:users!to_user_id(first_name, last_name, is_clinician)
            `)
            .single();

          if (error) throw error;
          message = data;
        } else {
          // Use Drizzle ORM for Replit database
          const [msg] = await db.insert(messages).values({
            fromUserId: socket.userId,
            toUserId,
            content,
            isEmergency,
            createdAt: new Date(),
          }).returning();

          // Fetch user info
          const [fromUser] = await db.select({
            firstName: users.firstName,
            lastName: users.lastName,
            isClinician: users.isClinician,
          })
            .from(users)
            .where(eq(users.id, socket.userId));

          message = {
            ...msg,
            from_user: fromUser
          };
        }

        // Send message to recipient
        io.to(`user_${toUserId}`).emit('new-message', {
          id: message.id,
          content: message.content,
          isEmergency: message.is_emergency || message.isEmergency,
          createdAt: message.created_at || message.createdAt,
          from: {
            id: socket.userId,
            name: `${message.from_user.first_name || message.from_user.firstName} ${message.from_user.last_name || message.from_user.lastName}`,
            isClinician: message.from_user.is_clinician || message.from_user.isClinician
          }
        });

        // Confirm to sender
        socket.emit('message-sent', {
          id: message.id,
          toUserId,
          createdAt: message.created_at || message.createdAt
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark message as read
    socket.on('mark-message-read', async (messageId) => {
      try {
        if (supabase) {
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', messageId)
            .eq('to_user_id', socket.userId);
        } else {
          await db.update(messages)
            .set({ readAt: new Date() })
            .where(and(
              eq(messages.id, messageId),
              eq(messages.toUserId, socket.userId)
            ));
        }

        socket.emit('message-read-confirmed', { messageId });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Clinical consultation requests
    socket.on('request-consultation', async ({ urgency, symptoms, notes }) => {
      try {
        // Find available clinicians
        let clinicians;
        if (supabase) {
          const { data } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .eq('is_clinician', true);
          clinicians = data || [];
        } else {
          clinicians = await db.select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
          })
            .from(users)
            .where(eq(users.isClinician, true));
        }

        // Broadcast consultation request to all online clinicians
        clinicians.forEach(clinician => {
          io.to(`user_${clinician.id}`).emit('consultation-request', {
            patientId: socket.userId,
            urgency,
            symptoms,
            notes,
            timestamp: new Date().toISOString()
          });
        });

        socket.emit('consultation-requested', {
          message: 'Your consultation request has been sent to available clinicians'
        });

      } catch (error) {
        console.error('Error requesting consultation:', error);
        socket.emit('error', { message: 'Failed to request consultation' });
      }
    });

    // Clinician accepts consultation
    socket.on('accept-consultation', async ({ patientId }) => {
      try {
        // Notify patient that clinician accepted
        io.to(`user_${patientId}`).emit('consultation-accepted', {
          clinicianId: socket.userId,
          timestamp: new Date().toISOString()
        });

        // Notify other clinicians that consultation was taken
        const { data: clinicians } = await supabase
          .from('users')
          .select('id')
          .eq('is_clinician', true)
          .neq('id', socket.userId);

        clinicians?.forEach(clinician => {
          io.to(`user_${clinician.id}`).emit('consultation-taken', {
            patientId,
            takenBy: socket.userId
          });
        });

      } catch (error) {
        console.error('Error accepting consultation:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from real-time services`);
    });

    // Typing indicators for messaging
    socket.on('typing-start', ({ toUserId }) => {
      io.to(`user_${toUserId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing-stop', ({ toUserId }) => {
      io.to(`user_${toUserId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Emergency alert system
    socket.on('emergency-alert', async ({ symptoms, urgency, location }) => {
      try {
        // Log emergency alert
        if (supabase) {
          await supabase.from('emergency_alerts').insert({
            user_id: socket.userId,
            symptoms,
            urgency,
            location,
            created_at: new Date().toISOString(),
          });
        }

        // Broadcast to all online clinicians immediately
        const { data: clinicians } = await supabase
          .from('users')
          .select('id')
          .eq('is_clinician', true);

        clinicians?.forEach(clinician => {
          io.to(`user_${clinician.id}`).emit('emergency-alert', {
            patientId: socket.userId,
            symptoms,
            urgency,
            location,
            timestamp: new Date().toISOString()
          });
        });

        socket.emit('emergency-alert-sent', {
          message: 'Emergency alert sent to all available clinicians'
        });

      } catch (error) {
        console.error('Error sending emergency alert:', error);
        socket.emit('error', { message: 'Failed to send emergency alert' });
      }
    });
  });

  return io;
}