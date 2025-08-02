import express from 'express';
import { supabase } from './supabaseClient.js';
import { db } from './db.ts';
import { messages, users } from '@shared/schema';
import { eq, and, or, desc } from 'drizzle-orm';

const router = express.Router();

// Middleware to check authentication (Supabase or Replit fallback)
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (supabase && token) {
    // Supabase authentication
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { id: user.id, phone: user.phone };
  } else if (req.isAuthenticated && req.isAuthenticated()) {
    // Replit authentication fallback
    req.user = { id: req.user.claims.sub };
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Get conversations list for current user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    if (supabase) {
      // Use Supabase for database operations
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          from_user:users!from_user_id(id, first_name, last_name, is_clinician),
          to_user:users!to_user_id(id, first_name, last_name, is_clinician)
        `)
        .or(`from_user_id.eq.${req.user.id},to_user_id.eq.${req.user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process conversations
      const conversationsMap = new Map();
      
      data?.forEach(message => {
        const otherUser = message.from_user_id === req.user.id ? message.to_user : message.from_user;
        const conversationKey = otherUser.id;
        
        if (!conversationsMap.has(conversationKey)) {
          conversationsMap.set(conversationKey, {
            userId: otherUser.id,
            userName: `${otherUser.first_name} ${otherUser.last_name}`,
            isClinician: otherUser.is_clinician,
            lastMessage: message,
            unreadCount: 0
          });
        }
        
        // Count unread messages
        if (message.to_user_id === req.user.id && !message.read_at) {
          conversationsMap.get(conversationKey).unreadCount++;
        }
      });

      res.json(Array.from(conversationsMap.values()));
    } else {
      // Use Drizzle ORM for Replit database - simplified for demo
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific conversation
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    if (supabase) {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          from_user:users!from_user_id(first_name, last_name, is_clinician)
        `)
        .or(`and(from_user_id.eq.${req.user.id},to_user_id.eq.${userId}),and(from_user_id.eq.${userId},to_user_id.eq.${req.user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('from_user_id', userId)
        .eq('to_user_id', req.user.id)
        .is('read_at', null);

      const formattedMessages = data?.map(message => ({
        id: message.id,
        content: message.content,
        fromUserId: message.from_user_id,
        toUserId: message.to_user_id,
        isEmergency: message.is_emergency,
        readAt: message.read_at,
        createdAt: message.created_at,
        from: {
          name: `${message.from_user.first_name} ${message.from_user.last_name}`,
          isClinician: message.from_user.is_clinician
        }
      })) || [];

      res.json(formattedMessages);
    } else {
      // Use Drizzle ORM for Replit database - simplified for demo
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/', authenticate, async (req, res) => {
  try {
    const { toUserId, content, isEmergency = false } = req.body;

    if (!toUserId || !content?.trim()) {
      return res.status(400).json({ error: 'toUserId and content are required' });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          from_user_id: req.user.id,
          to_user_id: toUserId,
          content: content.trim(),
          is_emergency: isEmergency,
          created_at: new Date().toISOString(),
        })
        .select(`
          *,
          from_user:users!from_user_id(first_name, last_name, is_clinician)
        `)
        .single();

      if (error) throw error;

      const formattedMessage = {
        id: data.id,
        content: data.content,
        fromUserId: data.from_user_id,
        toUserId: data.to_user_id,
        isEmergency: data.is_emergency,
        readAt: data.read_at,
        createdAt: data.created_at,
        from: {
          name: `${data.from_user.first_name} ${data.from_user.last_name}`,
          isClinician: data.from_user.is_clinician
        }
      };

      res.json(formattedMessage);
    } else {
      // Use Drizzle ORM for Replit database - simplified for demo
      res.json({ id: 'demo', content, fromUserId: req.user.id, toUserId, createdAt: new Date() });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.patch('/:messageId/read', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;

    if (supabase) {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('to_user_id', req.user.id);

      if (error) throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Get available healthcare providers for messaging
router.get('/providers/available', authenticate, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('is_clinician', true);

      if (error) throw error;

      const providers = data?.map(provider => ({
        id: provider.id,
        name: `${provider.first_name} ${provider.last_name}`,
        email: provider.email
      })) || [];

      res.json(providers);
    } else {
      // Demo data for Replit fallback
      res.json([
        { id: 'provider-1', name: 'Dr. Sarah Wilson', email: 'dr.wilson@clinic.com' },
        { id: 'provider-2', name: 'Nurse Jennifer Davis', email: 'j.davis@clinic.com' }
      ]);
    }
  } catch (error) {
    console.error('Error fetching available providers:', error);
    res.status(500).json({ error: 'Failed to fetch available providers' });
  }
});

export default router;