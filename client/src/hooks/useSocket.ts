import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Create socket connection with authentication
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const socket = io(wsUrl, {
      path: '/ws',
      auth: {
        token: localStorage.getItem('supabase_token') || null,
        replitUserId: user.id,
      },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to real-time services');
    });

    socket.on('connect_error', (error) => {
      console.error('Real-time connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from real-time services:', reason);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  return socketRef.current;
}

// Hook for forum thread functionality
export function useForumSocket(threadId?: string) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !threadId) return;

    socket.emit('join-thread', threadId);

    return () => {
      socket.emit('leave-thread', threadId);
    };
  }, [socket, threadId]);

  const postReply = (content: string, isAnonymous = false) => {
    if (!socket || !threadId) return;
    socket.emit('post-reply', { threadId, content, isAnonymous });
  };

  return { socket, postReply };
}

// Hook for direct messaging
export function useMessagingSocket() {
  const socket = useSocket();

  const sendMessage = (toUserId: string, content: string, isEmergency = false) => {
    if (!socket) return;
    socket.emit('send-message', { toUserId, content, isEmergency });
  };

  const markMessageRead = (messageId: string) => {
    if (!socket) return;
    socket.emit('mark-message-read', messageId);
  };

  const startTyping = (toUserId: string) => {
    if (!socket) return;
    socket.emit('typing-start', { toUserId });
  };

  const stopTyping = (toUserId: string) => {
    if (!socket) return;
    socket.emit('typing-stop', { toUserId });
  };

  return { 
    socket, 
    sendMessage, 
    markMessageRead, 
    startTyping, 
    stopTyping 
  };
}

// Hook for clinical consultations
export function useConsultationSocket() {
  const socket = useSocket();

  const requestConsultation = (urgency: 'low' | 'medium' | 'high', symptoms: string, notes?: string) => {
    if (!socket) return;
    socket.emit('request-consultation', { urgency, symptoms, notes });
  };

  const acceptConsultation = (patientId: string) => {
    if (!socket) return;
    socket.emit('accept-consultation', { patientId });
  };

  const sendEmergencyAlert = (symptoms: string, urgency: 'high' | 'critical', location?: string) => {
    if (!socket) return;
    socket.emit('emergency-alert', { symptoms, urgency, location });
  };

  return {
    socket,
    requestConsultation,
    acceptConsultation,
    sendEmergencyAlert
  };
}