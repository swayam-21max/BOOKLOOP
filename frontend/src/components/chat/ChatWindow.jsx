import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { useAuth } from '../../hooks/useAuth';

const ChatWindow = ({ messages, otherUserName }) => {
  const { user } = useAuth();
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <h3 style={{ fontSize: '18px' }}>{otherUserName || 'Chat'}</h3>
      </div>
      
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: 'var(--space-md)', 
        background: '#F1F5F9' 
      }}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user.id} />
        ))}
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={scrollRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
