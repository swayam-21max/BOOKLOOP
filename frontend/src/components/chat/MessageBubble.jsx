import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: isOwn ? 'flex-end' : 'flex-start', 
      marginBottom: '10px' 
    }}>
      <div style={{ 
        maxWidth: '70%', 
        padding: '10px 14px', 
        borderRadius: '12px', 
        fontSize: '14px',
        backgroundColor: isOwn ? 'var(--primary)' : 'white',
        color: isOwn ? 'white' : 'var(--text-primary)',
        boxShadow: 'var(--shadow-sm)',
        border: !isOwn ? '1px solid var(--border)' : 'none',
        borderBottomRightRadius: isOwn ? '2px' : '12px',
        borderBottomLeftRadius: isOwn ? '12px' : '2px',
      }}>
        {message.content}
        <div style={{ 
          fontSize: '10px', 
          marginTop: '4px', 
          textAlign: 'right', 
          opacity: 0.7 
        }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
