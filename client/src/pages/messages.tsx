import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMessagingSocket } from "@/hooks/useSocket";
import { MessageCircle, Send, AlertTriangle, Users, Clock, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  content: string;
  fromUserId: string;
  toUserId: string;
  isEmergency: boolean;
  readAt?: string;
  createdAt: string;
  from: {
    name: string;
    isClinician: boolean;
  };
}

interface Conversation {
  userId: string;
  userName: string;
  isClinician: boolean;
  lastMessage?: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { socket, sendMessage, markMessageRead, startTyping, stopTyping } = useMessagingSocket();

  // Fetch conversations list
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedConversation],
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { toUserId: string; content: string; isEmergency?: boolean }) => {
      return apiRequest("/api/messages", "POST", data);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Setup real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      // Add new message to the conversation
      queryClient.setQueryData(["/api/messages", message.from.id], (oldMessages: Message[] = []) => [
        ...oldMessages,
        message
      ]);
      
      // Update conversations list
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      
      // Show notification if not current conversation
      if (selectedConversation !== message.from.id) {
        toast({
          title: `New message from ${message.from.name}`,
          description: message.content.length > 50 
            ? message.content.substring(0, 50) + "..." 
            : message.content,
        });
      }
    };

    const handleUserTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    };

    const handleMessageSent = () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('message-sent', handleMessageSent);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('message-sent', handleMessageSent);
    };
  }, [socket, selectedConversation, queryClient, toast]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicators
  useEffect(() => {
    if (!selectedConversation || !newMessage.trim()) return;

    startTyping(selectedConversation);

    const typingTimeout = setTimeout(() => {
      stopTyping(selectedConversation);
    }, 1000);

    return () => {
      clearTimeout(typingTimeout);
      stopTyping(selectedConversation);
    };
  }, [newMessage, selectedConversation, startTyping, stopTyping]);

  const handleSendMessage = (isEmergency = false) => {
    if (!selectedConversation || !newMessage.trim()) return;

    if (socket) {
      sendMessage(selectedConversation, newMessage.trim(), isEmergency);
    } else {
      // Fallback to API
      sendMessageMutation.mutate({
        toUserId: selectedConversation,
        content: newMessage.trim(),
        isEmergency,
      });
    }
  };

  const handleMessageRead = (messageId: string) => {
    markMessageRead(messageId);
  };

  const selectedConversationData = conversations.find(c => c.userId === selectedConversation);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            Secure messaging with your healthcare team and community members
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => window.open('https://mooreobgyn.com/', '_blank')}
          className="border-rose-deep text-rose-deep hover:bg-rose-deep hover:text-white"
        >
          Schedule Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {conversationsLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a conversation with a healthcare provider</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.userId}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                        selectedConversation === conversation.userId ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.userId)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {conversation.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm truncate">
                              {conversation.userName}
                              {conversation.isClinician && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Provider
                                </Badge>
                              )}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="default" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {selectedConversationData?.userName}
                  {selectedConversationData?.isClinician && (
                    <Badge variant="outline">Healthcare Provider</Badge>
                  )}
                </CardTitle>
                {typingUsers.has(selectedConversation) && (
                  <CardDescription className="text-blue-600">
                    {selectedConversationData?.userName} is typing...
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="p-0 flex flex-col h-[450px]">
                {/* Messages List */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation below</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.fromUserId === selectedConversation ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              message.fromUserId === selectedConversation
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-blue-500 text-white'
                            } ${message.isEmergency ? 'border-2 border-red-500' : ''}`}
                          >
                            {message.isEmergency && (
                              <div className="flex items-center gap-2 mb-2 text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-xs font-medium">Emergency Message</span>
                              </div>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                              <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                              {message.fromUserId !== selectedConversation && (
                                <div className="flex items-center gap-1">
                                  {message.readAt ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Clock className="h-3 w-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      rows={2}
                      className="flex-1 resize-none"
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleSendMessage(false)}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleSendMessage(true)}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        variant="destructive"
                        size="sm"
                        title="Send as emergency message"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Select a conversation to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}