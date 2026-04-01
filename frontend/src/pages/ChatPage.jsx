// frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import messageService from '../services/messageService';
import { connectSocket, getSocket } from '../socket/socketClient';
import '../styles/chat.css';

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize Socket and Fetch Conversations
  useEffect(() => {
    const socket = connectSocket();
    fetchConversations();

    if (socket) {
      socket.on('receive_message', (message) => {
        // If the message is from/to the active chat, add it
        if (activeChat && (message.sender_id === activeChat.id || message.receiver_id === activeChat.id)) {
          setMessages(prev => [...prev, message]);
        }
        // Update conversation list last message
        updateConversationsList(message);
      });

      socket.on('new_message_notification', (message) => {
        updateConversationsList(message);
      });

      socket.on('typing', (data) => {
        if (activeChat && data.userId === activeChat.id) {
          setOtherUserTyping(true);
        }
      });

      socket.on('stop_typing', (data) => {
        if (activeChat && data.userId === activeChat.id) {
          setOtherUserTyping(false);
        }
      });

      socket.on('user_status', (data) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (data.status === 'online') newSet.add(data.userId);
          else newSet.delete(data.userId);
          return newSet;
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('new_message_notification');
        socket.off('typing');
        socket.off('stop_typing');
        socket.off('user_status');
      }
    };
  }, [activeChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  const fetchConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const loadChat = async (convo) => {
    setActiveChat(convo);
    setOtherUserTyping(false);
    try {
      const history = await messageService.getMessages(convo.id);
      setMessages(history);
      // Join socket room
      const socket = getSocket();
      if (socket) {
        socket.emit('join_room', { otherUserId: convo.id });
      }
      // Mark as read
      await messageService.markAsRead(convo.id);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (!socket || !activeChat) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { receiver_id: activeChat.id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop_typing', { receiver_id: activeChat.id });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('send_message', {
        receiver_id: activeChat.id,
        content: inputText
      });
      setInputText('');
      setIsTyping(false);
      socket.emit('stop_typing', { receiver_id: activeChat.id });
    }
  };

  const updateConversationsList = (message) => {
    setConversations(prev => {
      const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
      const index = prev.findIndex(c => c.id === otherUserId);
      
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          last_message: message.content,
          last_timestamp: message.timestamp
        };
        // Move to top
        const item = updated.splice(index, 1)[0];
        return [item, ...updated];
      } else {
        // New conversation, need to fetch to get user name
        fetchConversations();
        return prev;
      }
    });
  };

  return (
    <div className="container">
      <div className="chat-container">
        {/* Sidebar */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <span>Messages</span>
          </div>
          <div className="conversation-list">
            {conversations.map(convo => (
              <div 
                key={convo.id} 
                className={`convo-item ${activeChat?.id === convo.id ? 'active' : ''}`}
                onClick={() => loadChat(convo)}
              >
                <div className="convo-info">
                  <span className="convo-name">
                    <div className={`presence-indicator ${onlineUsers.has(convo.id) ? 'online' : ''}`}></div>
                    {convo.name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {convo.last_timestamp ? new Date(convo.last_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="last-msg">
                  {convo.last_sender_id === user.id ? 'You: ' : ''}{convo.last_message}
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="flex align-center justify-center" style={{ height: '200px', color: 'var(--text-secondary)' }}>
                No conversations yet.
              </div>
            )}
          </div>
        </aside>

        {/* Main Area */}
        <main className="chat-main">
          {activeChat ? (
            <>
              <header className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={`presence-indicator ${onlineUsers.has(activeChat.id) ? 'online' : ''}`}></div>
                  <h3 style={{ fontSize: '18px' }}>{activeChat.name}</h3>
                </div>
              </header>

              <div className="messages-area">
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`message-bubble ${msg.sender_id === user.id ? 'message-sent' : 'message-received'}`}
                  >
                    {msg.content}
                    <span className="msg-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                {otherUserTyping && (
                  <div className="typing-indicator">
                    <div className="dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                    <span>{activeChat.name} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-bar">
                <form onSubmit={handleSendMessage} className="input-container">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={inputText}
                    onChange={handleInputChange}
                  />
                  <button type="submit" className="send-btn" disabled={!inputText.trim()}>
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex align-center justify-center flex-column" style={{ height: '100%', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px' }}>💬</span>
              <p>Select a student to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
