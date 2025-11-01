import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { apiService } from '../api/api';
import toast from 'react-hot-toast';
import { MessageSquare, X, Send, Users, Paperclip, Smile } from 'lucide-react';
import io from 'socket.io-client';

type SocketType = ReturnType<typeof io>;

interface ChatMessage {
  id: string;
  userId: string;
  roomId?: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  content: string;
  type: string;
  attachmentUrl: string | null;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  isMember: boolean;
  isPublic?: boolean;
}

const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeSocket();
      fetchChatRooms();
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (selectedRoom && socket) {
      socket.emit('join_chat_room', selectedRoom);
      fetchChatMessages(selectedRoom);
      
      // Set up message listener
      socket.on('chat_message', (message: ChatMessage) => {
        if (message.roomId === selectedRoom) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('user_typing', (data: { userId: string; username: string; isTyping: boolean }) => {
        if (data.isTyping) {
          setTypingUsers(prev => new Set(prev).add(data.username));
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.username);
            return newSet;
          });
        }
      });

      return () => {
        socket.off('chat_message');
        socket.off('user_typing');
      };
    }
  }, [selectedRoom, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const newSocket = io(API_URL, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('authToken')
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;
      if (userId) {
        newSocket.emit('join_user', userId);
      }
      updateChatStatus('online');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(newSocket);
  };

  const fetchChatRooms = async () => {
    try {
      const response = await apiService.getChatRooms();
      if (response.success) {
        setRooms(response.data || []);
        // Auto-join first public room if no room selected
        if (response.data && response.data.length > 0 && !selectedRoom) {
          const publicRoom = response.data.find((r: ChatRoom) => r.isPublic && r.type === 'public');
          if (publicRoom && !publicRoom.isMember) {
            await apiService.joinChatRoom(publicRoom.id);
          }
          if (publicRoom) {
            setSelectedRoom(publicRoom.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  const fetchChatMessages = async (roomId: string) => {
    try {
      const response = await apiService.getChatMessages(roomId);
      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const response = await apiService.getOnlineUsers();
      if (response.success) {
        setOnlineUsers(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  const updateChatStatus = async (status: string) => {
    try {
      await apiService.updateChatStatus(status, selectedRoom || undefined);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !selectedRoom) return;

    try {
      const response = await apiService.sendChatMessage(selectedRoom, { content: messageInput });
      if (response.success) {
        setMessageInput('');
        // Message will be added via socket
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedRoom) return;

    socket.emit('typing', {
      roomId: selectedRoom,
      userId: JSON.parse(localStorage.getItem('userData') || '{}').id,
      username: JSON.parse(localStorage.getItem('userData') || '{}').username,
      isTyping: true
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        roomId: selectedRoom,
        userId: JSON.parse(localStorage.getItem('userData') || '{}').id,
        username: JSON.parse(localStorage.getItem('userData') || '{}').username,
        isTyping: false
      });
    }, 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-semibold">Live Chat</h3>
          {onlineUsers.length > 0 && (
            <Badge variant="secondary" className="bg-white/20 text-white">
              {onlineUsers.length} online
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            if (socket) {
              updateChatStatus('offline');
              socket.disconnect();
            }
          }}
          className="text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Rooms List */}
      {!selectedRoom ? (
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Chat Rooms</h4>
          <div className="space-y-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => {
                  if (!room.isMember) {
                    apiService.joinChatRoom(room.id).then(() => {
                      setSelectedRoom(room.id);
                      fetchChatRooms();
                    });
                  } else {
                    setSelectedRoom(room.id);
                  }
                }}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{room.name}</p>
                    <p className="text-sm text-gray-600">{room.memberCount} members</p>
                  </div>
                  {room.type === 'public' && (
                    <Badge variant="outline">Public</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">
                    {message.user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{message.user.username}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    <p className="text-sm text-gray-900">{message.content}</p>
                    {message.attachmentUrl && (
                      <a
                        href={message.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs mt-1 block"
                      >
                        View attachment
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {typingUsers.size > 0 && (
              <div className="text-xs text-gray-500 italic">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => {}}>
                <Smile className="h-4 w-4 text-gray-600" />
              </Button>
              <Input
                value={messageInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => {}}>
                <Paperclip className="h-4 w-4 text-gray-600" />
              </Button>
              <Button type="submit" size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-center text-gray-600">
        Live chat • Real-time messaging
      </div>
    </div>
  );
};

export default LiveChatWidget;

