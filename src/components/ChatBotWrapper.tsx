import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatBot } from './ChatBot';

export const ChatBotWrapper: React.FC = () => {
  const { user, userRole, loading } = useAuth();

  // Don't render if still loading
  if (loading) {
    return null;
  }

  // Show chatbot for both authenticated and guest users
  return (
    <ChatBot 
      userRole={userRole || 'guest'}
      userId={user?.id || 'guest'}
      language="en"
    />
  );
};