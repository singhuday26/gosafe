import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  userRole?: string;
  userId?: string;
  language?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ 
  userRole = 'tourist', 
  userId,
  language = 'en' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chat opens
      const welcomeMessage = getWelcomeMessage(userRole);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, userRole, messages.length]);

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case 'tourist':
        return "Hello! I'm your AI travel assistant. I can help you with safety information, travel tips, emergency procedures, and local guidance. How can I assist you today?";
      case 'authority':
        return "Hello! I'm here to assist you with tourism authority operations. I can help with monitoring tourist safety, managing alerts, and providing administrative guidance. What do you need help with?";
      case 'admin':
        return "Hello! I'm your AI assistant for system administration. I can help with platform management, user oversight, and system operations. How can I help you today?";
      case 'guest':
        return "Hello! I'm your AI assistant for the Smart Tourist Safety System. I can provide information about our platform, safety features, and help with general tourism questions. Sign in to access more personalized features!";
      default:
        return "Hello! I'm your AI assistant. How can I help you today?";
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: inputMessage,
          sessionId,
          userId: userId === 'guest' ? null : userId,
          userRole,
          languageCode: language
        }
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Store session ID for future messages
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full p-0 shadow-ne-medium hover:shadow-ne-glow transition-ne z-50 bg-ne-tea-brown hover:bg-ne-maroon animate-pulse-ne"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 w-80 shadow-ne-strong z-50 transition-ne ne-card border-ne-tea-brown/20 ${
      isMinimized ? 'h-12' : 'h-96'
    }`}>
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0 bg-ne-tea-brown text-white rounded-t-xl">
        <CardTitle className="text-sm font-medium font-heading">AI Assistant</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-3 pt-0 flex flex-col h-full">
          <ScrollArea className="flex-1 mb-3 h-64">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm font-body transition-ne ${
                      message.role === 'user'
                        ? 'bg-ne-tea-brown text-white'
                        : 'bg-ne-mist-gray text-ne-tea-brown'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-ne-mist-gray text-ne-tea-brown rounded-lg px-3 py-2 text-sm font-body">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-ne-tea-brown rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-ne-tea-brown rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-ne-tea-brown rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 font-body border-ne-tea-brown/20 focus:border-ne-tea-brown"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              size="icon"
              disabled={isLoading || !inputMessage.trim()}
              className="shrink-0 bg-ne-tea-brown hover:bg-ne-maroon text-white transition-ne"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};