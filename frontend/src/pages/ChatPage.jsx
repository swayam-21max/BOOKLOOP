// frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import messageService from '../services/messageService';
import toast from 'react-hot-toast';
import '../styles/chat.css';

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch Conversations and Poll for New Messages
  useEffect(() => {
    fetchConversations();
    const convoInterval = setInterval(fetchConversations, 10000);
    return () => clearInterval(convoInterval);
  }, []);

  useEffect(() => {
    if (!activeChat) return;

    const fetchCurrentMessages = async () => {
      try {
        const history = await messageService.getMessages(activeChat.id);
        setMessages(history);
      } catch (err) {
        console.error('Failed to poll messages:', err);
      }
    };

    fetchCurrentMessages();
    const msgInterval = setInterval(fetchCurrentMessages, 5000);
    return () => clearInterval(msgInterval);
  }, [activeChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    try {
      const history = await messageService.getMessages(convo.id);
      setMessages(history);
      await messageService.markAsRead(convo.id);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const contentToSend = inputText;
    setInputText('');

    try {
      const newMsg = await messageService.sendMessage({
        receiver_id: activeChat.id,
        content: contentToSend
      });
      setMessages(prev => [...prev, newMsg]);
      fetchConversations();
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  // Image Upload handler for chat
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
      const newMsg = await messageService.sendMessage({
        receiver_id: activeChat.id,
        content: '',
        image_url: response.imageUrl
      });
      setMessages(prev => [...prev, newMsg]);
      toast.success('Image shared! 🖼️', { id: uploadToast });
      fetchConversations();
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
                      Active
                    </span>
                  </div>
                </div>

                {/* Message Search Filter */}
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

                      {/* Msg Timestamp and Receipts */}
                      <span className="msg-time" style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isSentByMe && (
                          <span style={{ fontSize: '13px', lineHeight: '1' }}>
                            {msg.is_read ? (
                              <span style={{ color: '#3b82f6' }}>✓✓</span>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)' }}>✓</span>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
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
