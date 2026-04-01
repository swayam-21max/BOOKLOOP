import React, { useState } from 'react';

const ChatInput = ({ onSendMessage }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-sm" style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
      <input 
        type="text" 
        className="form-control" 
        placeholder="Type a message..." 
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="btn btn-primary">Send</button>
    </form>
  );
};

export default ChatInput;
