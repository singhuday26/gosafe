import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatBot } from './ChatBot';

export const ChatBotWrapper: React.FC = () => {
  const { user, userRole, loading } = useAuth();

  // Don't render if loading or user not authenticated
  if (loading || !user || !userRole) {
    return null;
  }

  return (
    <ChatBot 
      userRole={userRole}
      userId={user.id}
      language="en"
    />
  );
};