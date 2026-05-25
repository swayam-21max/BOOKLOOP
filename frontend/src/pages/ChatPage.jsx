// frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import messageService from '../services/messageService';
import { connectSocket, getSocket } from '../socket/socketClient';
import toast from 'react-hot-toast';
import '../styles/chat.css';

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Message Search (Feature 12)
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Socket and Fetch Conversations
  useEffect(() => {
    const socket = connectSocket();
    fetchConversations();

    if (socket) {
      // Sync complete list of currently online users
      socket.on('online_users_list', (usersList) => {
        setOnlineUsers(new Set(usersList));
      });

      socket.on('receive_message', (message) => {
        // If the message belongs to active chat, add it and emit mark_read
        if (activeChat && (message.sender_id === activeChat.id || message.receiver_id === activeChat.id)) {
          setMessages(prev => [...prev, message]);
          
          if (message.sender_id === activeChat.id) {
            socket.emit('mark_read', { sender_id: activeChat.id });
          }
        }
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

      // Handle real-time read receipt updates
      socket.on('messages_read', (data) => {
        if (activeChat && data.readerId === activeChat.id) {
          setMessages(prev =>
            prev.map(m => m.sender_id === user.id ? { ...m, is_read: true } : m)
          );
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
        socket.off('online_users_list');
        socket.off('receive_message');
        socket.off('new_message_notification');
        socket.off('typing');
        socket.off('stop_typing');
        socket.off('messages_read');
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
      
      const socket = getSocket();
      if (socket) {
        socket.emit('join_room', { otherUserId: convo.id });
        // Emit read receipt back to the sender
        socket.emit('mark_read', { sender_id: convo.id });
      }
      
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

  // Image Upload handler for chat (Feature 12)
  const handleImageUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleImageSelected = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    const uploadToast = toast.loading('Uploading shared image...');
    try {
      const response = await messageService.uploadImage(formData);
      const socket = getSocket();
      
      if (socket) {
        socket.emit('send_message', {
          receiver_id: activeChat.id,
          content: '',
          image_url: response.imageUrl
        });
        toast.success('Image shared! 🖼️', { id: uploadToast });
      }
    } catch (err) {
      toast.error('Failed to upload image', { id: uploadToast });
    } finally {
      setUploadingImage(false);
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
          last_message: message.content || '📷 Sent an image',
          last_timestamp: message.timestamp
        };
        const item = updated.splice(index, 1)[0];
        return [item, ...updated];
      } else {
        fetchConversations();
        return prev;
      }
    });
  };

  // Filter messages based on search query (Feature 12)
  const filteredMessages = messages.filter(msg => {
    if (!searchQuery) return true;
    return msg.content && msg.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="container" style={{ paddingTop: 'var(--space-md)' }}>
      <div className="chat-container card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: '320px 1fr', padding: '0', overflow: 'hidden', height: '80vh', borderRadius: '16px' }}>
        
        {/* Sidebar contacts list */}
        <aside className="chat-sidebar" style={{ borderRight: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div className="chat-sidebar-header" style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border)', fontSize: '20px', fontWeight: 800 }}>
            <span>Campus Inbox</span>
          </div>
          <div className="conversation-list" style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.map(convo => (
              <div 
                key={convo.id} 
                className={`convo-item ${activeChat?.id === convo.id ? 'active' : ''}`}
                onClick={() => loadChat(convo)}
                style={{
                  padding: 'var(--space-md)',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: activeChat?.id === convo.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div className="convo-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="convo-name" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: onlineUsers.has(convo.id) ? 'var(--success)' : '#475569'
                    }}></div>
                    {convo.name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    {convo.last_timestamp ? new Date(convo.last_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="last-msg" style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {convo.last_sender_id === user.id ? 'You: ' : ''}{convo.last_message}
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="flex align-center justify-center" style={{ height: '200px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                No active conversations yet.
              </div>
            )}
          </div>
        </aside>

        {/* Messaging Area */}
        <main className="chat-main" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {activeChat ? (
            <>
              <header className="chat-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: onlineUsers.has(activeChat.id) ? 'var(--success)' : '#475569'
                  }}></div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0' }}>{activeChat.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {onlineUsers.has(activeChat.id) ? 'Online now' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Message Search Filter (Feature 12) */}
                <div>
                  <input
                    type="text"
                    placeholder="🔍 Search messages..."
                    className="form-control"
                    style={{ width: '180px', padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </header>

              <div className="messages-area" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredMessages.map(msg => {
                  const isSentByMe = msg.sender_id === user.id;
                  
                  return (
                    <div 
                      key={msg.id} 
                      style={{
                        alignSelf: isSentByMe ? 'flex-end' : 'flex-start',
                        maxWidth: '65%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isSentByMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div 
                        className={`message-bubble ${isSentByMe ? 'message-sent' : 'message-received'}`}
                        style={{
                          background: isSentByMe ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                          color: 'white',
                          padding: '10px 16px',
                          borderRadius: isSentByMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          border: isSentByMe ? 'none' : '1px solid var(--glass-border)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        {msg.image_url ? (
                          <img 
                            src={msg.image_url} 
                            alt="Shared upload" 
                            style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '12px', objectFit: 'cover', display: 'block', marginBottom: '4px' }} 
                          />
                        ) : null}
                        
                        {msg.content ? <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>{msg.content}</p> : null}
                      </div>

                      {/* Msg Timestamp and Receipts Double Checkmarks (Feature 12) */}
                      <span className="msg-time" style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isSentByMe && (
                          <span style={{ fontSize: '13px', lineHeight: '1' }}>
                            {msg.is_read ? (
                              <span style={{ color: '#3b82f6' }}>✓✓</span> // Blue Read
                            ) : onlineUsers.has(msg.receiver_id) || msg.is_delivered ? (
                              <span style={{ color: 'var(--text-secondary)' }}>✓✓</span> // Delivered
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>✓</span> // Sent
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}

                {otherUserTyping && (
                  <div className="typing-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '8px 16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <div className="dots" style={{ display: 'flex', gap: '4px' }}>
                      <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animation: 'bounce 1.4s infinite' }}></div>
                      <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animation: 'bounce 1.4s infinite 0.2s' }}></div>
                      <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animation: 'bounce 1.4s infinite 0.4s' }}></div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{activeChat.name} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Send Input bar */}
              <div className="chat-input-bar" style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
                <form onSubmit={handleSendMessage} className="input-container" style={{ display: 'flex', gap: '12px', width: '100%', alignItems: 'center' }}>
                  
                  {/* File Uploader trigger button */}
                  <input type="file" ref={fileInputRef} onChange={handleImageSelected} accept="image/*" style={{ display: 'none' }} />
                  <button 
                    type="button" 
                    onClick={handleImageUploadClick} 
                    disabled={uploadingImage}
                    style={{ fontSize: '20px', padding: '8px', color: 'var(--text-secondary)', borderRadius: '50%', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
                    title="Share Image"
                  >
                    🖼️
                  </button>

                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={inputText}
                    onChange={handleInputChange}
                    style={{ flex: 1, padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', height: '100%', borderRadius: '8px' }} disabled={!inputText.trim() && !uploadingImage}>
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex align-center justify-center flex-column" style={{ height: '100%', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '64px', marginBottom: '16px' }}>💬</span>
              <h3 style={{ margin: '0', fontWeight: 800 }}>Campus Chatroom</h3>
              <p style={{ fontSize: '13px' }}>Select a student exchange conversation from the list to begin exchanging books.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
