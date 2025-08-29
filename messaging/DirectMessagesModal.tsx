import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  Send, 
  Search, 
  X, 
  Phone, 
  Video, 
  Info, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { User, Message } from '../../types/app';

interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

interface DirectMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  conversations: Conversation[];
  messages: Message[];
  onSendMessage: (conversationId: string, content: string) => void;
  onStartConversation: (userId: string) => void;
  onMarkAsRead: (conversationId: string) => void;
  allUsers: User[];
}

export function DirectMessagesModal({
  isOpen,
  onClose,
  currentUser,
  conversations,
  messages,
  onSendMessage,
  onStartConversation,
  onMarkAsRead,
  allUsers
}: DirectMessagesModalProps) {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.participants.some(p => 
      p.id !== currentUser.id && 
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       p.username.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  // Get messages for active conversation
  const activeMessages = activeConversation 
    ? messages.filter(m => m.conversationId === activeConversation)
    : [];

  // Get other participant in conversation
  const getOtherParticipant = (conversation: Conversation): User => {
    return conversation.participants.find(p => p.id !== currentUser.id) || conversation.participants[0];
  };

  // Handle sending message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    onSendMessage(activeConversation, newMessage.trim());
    setNewMessage('');
    inputRef.current?.focus();
  };

  // Handle starting new conversation
  const handleStartNewChat = () => {
    if (selectedUsers.length === 0) return;
    
    // For now, just start conversation with first selected user
    onStartConversation(selectedUsers[0]);
    setShowNewChat(false);
    setSelectedUsers([]);
  };

  // Format time for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Mark conversation as read when opened
  useEffect(() => {
    if (activeConversation) {
      onMarkAsRead(activeConversation);
    }
  }, [activeConversation, onMarkAsRead]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex"
      >
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewChat(true)}
                  className="p-2"
                >
                  <Send className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                  <X className="size-4" />
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="size-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No conversations yet</p>
                  <p className="text-sm">Start a new chat to get connected!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation, index) => {
                    const otherUser = getOtherParticipant(conversation);
                    const isActive = activeConversation === conversation.id;
                    
                    return (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50
                          ${isActive ? 'bg-primary/10 border border-primary/20' : ''}
                        `}
                        onClick={() => setActiveConversation(conversation.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="size-12">
                              <AvatarImage src={otherUser.avatar} />
                              <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                            </Avatar>
                            {/* Online status */}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background online-indicator" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium truncate">{otherUser.name}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(conversation.updatedAt)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                              {conversation.lastMessage.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                {otherUser.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    ✓ Verified
                                  </Badge>
                                )}
                              </div>
                              
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                {(() => {
                  const conversation = conversations.find(c => c.id === activeConversation);
                  const otherUser = conversation ? getOtherParticipant(conversation) : null;
                  
                  return otherUser ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarImage src={otherUser.avatar} />
                          <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{otherUser.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Circle className="size-2 fill-green-500 text-green-500" />
                            Active now
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="p-2">
                          <Phone className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Video className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Info className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <MoreVertical className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {activeMessages.map((message, index) => {
                    const isOwn = message.senderId === currentUser.id;
                    const showAvatar = index === 0 || 
                      activeMessages[index - 1]?.senderId !== message.senderId;
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn && showAvatar && (
                          <Avatar className="size-6">
                            <AvatarImage src={allUsers.find(u => u.id === message.senderId)?.avatar} />
                            <AvatarFallback>
                              {allUsers.find(u => u.id === message.senderId)?.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        {!isOwn && !showAvatar && <div className="w-6" />}
                        
                        <div className={`
                          max-w-[70%] p-3 rounded-2xl
                          ${isOwn 
                            ? 'bg-primary text-primary-foreground rounded-br-md' 
                            : 'bg-muted rounded-bl-md'
                          }
                        `}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={inputRef}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="resize-none min-h-[40px] max-h-32 pr-20"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                      <Button variant="ghost" size="sm" type="button" className="p-1 h-6 w-6">
                        <Smile className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" type="button" className="p-1 h-6 w-6">
                        <Paperclip className="size-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={!newMessage.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 h-10 w-10"
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Send className="size-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>

        {/* New Chat Modal */}
        <AnimatePresence>
          {showNewChat && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-background rounded-xl p-6 w-96 max-h-[60vh] overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">New Message</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewChat(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
                
                <div className="mb-4">
                  <Input placeholder="Search people..." className="mb-3" />
                </div>
                
                <ScrollArea className="max-h-60 mb-4">
                  <div className="space-y-2">
                    {allUsers
                      .filter(user => user.id !== currentUser.id)
                      .slice(0, 10)
                      .map(user => (
                        <div
                          key={user.id}
                          className={`
                            flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50
                            ${selectedUsers.includes(user.id) ? 'bg-primary/10' : ''}
                          `}
                          onClick={() => {
                            setSelectedUsers(prev => 
                              prev.includes(user.id) 
                                ? prev.filter(id => id !== user.id)
                                : [...prev, user.id]
                            );
                          }}
                        >
                          <Avatar className="size-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowNewChat(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleStartNewChat}
                    disabled={selectedUsers.length === 0}
                    className="flex-1"
                  >
                    Start Chat
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}