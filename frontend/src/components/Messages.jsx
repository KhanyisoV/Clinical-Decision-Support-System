import React, { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.otherUserUsername, selectedConversation.otherUserRole);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUsername, otherRole) => {
    try {
      setError(null);
      const response = await messageService.getConversationMessages(otherUsername, otherRole);
      if (response.success) {
        setMessages(response.data);
        // Refresh conversations to update unread counts
        loadConversations();
      }
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      setError(null);

      const response = await messageService.sendMessage(
        selectedConversation.otherUserUsername,
        selectedConversation.otherUserRole,
        newMessage.trim()
      );

      if (response.success) {
        setNewMessage('');
        // Reload messages to show the new one
        await loadMessages(
          selectedConversation.otherUserUsername,
          selectedConversation.otherUserRole
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar - Conversations List */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Messages</h3>
          <button 
            onClick={loadConversations}
            style={styles.refreshButton}
            title="Refresh conversations"
          >
            🔄
          </button>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            {error}
          </div>
        )}

        <div style={styles.conversationList}>
          {conversations.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No conversations yet</p>
              <small>Start a conversation to see it here</small>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.conversationId}
                style={{
                  ...styles.conversationItem,
                  ...(selectedConversation?.conversationId === conv.conversationId
                    ? styles.conversationItemActive
                    : {})
                }}
                onClick={() => setSelectedConversation(conv)}
              >
                <div style={styles.conversationAvatar}>
                  {conv.otherUserRole === 'Client' && '👤'}
                  {conv.otherUserRole === 'Doctor' && '👨‍⚕️'}
                  {conv.otherUserRole === 'Admin' && '👔'}
                </div>
                
                <div style={styles.conversationInfo}>
                  <div style={styles.conversationTop}>
                    <span style={styles.conversationName}>
                      {conv.otherUserFullName || conv.otherUserUsername}
                    </span>
                    <span style={styles.conversationTime}>
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div style={styles.conversationBottom}>
                    <span style={styles.conversationRole}>
                      {conv.otherUserRole}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span style={styles.unreadBadge}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <p style={styles.lastMessage}>
                    {conv.lastMessage.substring(0, 50)}
                    {conv.lastMessage.length > 50 ? '...' : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={styles.chatArea}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <div style={styles.chatHeaderInfo}>
                <div style={styles.chatAvatar}>
                  {selectedConversation.otherUserRole === 'Client' && '👤'}
                  {selectedConversation.otherUserRole === 'Doctor' && '👨‍⚕️'}
                  {selectedConversation.otherUserRole === 'Admin' && '👔'}
                </div>
                <div>
                  <h3 style={styles.chatName}>
                    {selectedConversation.otherUserFullName || selectedConversation.otherUserUsername}
                  </h3>
                  <p style={styles.chatRole}>{selectedConversation.otherUserRole}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div style={styles.emptyChat}>
                  <p>No messages yet</p>
                  <small>Send a message to start the conversation</small>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.senderUsername === user?.userName;
                  
                  return (
                    <div
                      key={msg.id}
                      style={{
                        ...styles.messageWrapper,
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          ...styles.messageBubble,
                          ...(isOwnMessage ? styles.ownMessage : styles.otherMessage)
                        }}
                      >
                        <p style={styles.messageContent}>{msg.content}</p>
                        <span style={styles.messageTime}>
                          {formatTime(msg.sentAt)}
                          {isOwnMessage && msg.isRead && ' • Read'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} style={styles.messageInputForm}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={styles.messageInput}
                disabled={sendingMessage}
              />
              <button
                type="submit"
                style={{
                  ...styles.sendButton,
                  opacity: sendingMessage || !newMessage.trim() ? 0.5 : 1
                }}
                disabled={sendingMessage || !newMessage.trim()}
              >
                {sendingMessage ? '...' : '➤'}
              </button>
            </form>
          </>
        ) : (
          <div style={styles.noSelection}>
            <div style={styles.noSelectionContent}>
              <span style={styles.noSelectionIcon}>💬</span>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '1rem'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  sidebar: {
    width: '320px',
    backgroundColor: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column'
  },
  sidebarHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: 0
  },
  refreshButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '6px',
    transition: 'background-color 0.2s'
  },
  errorBanner: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    borderBottom: '1px solid #fcc'
  },
  conversationList: {
    flex: 1,
    overflowY: 'auto'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    color: '#6b7280'
  },
  conversationItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 1.5rem',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s'
  },
  conversationItemActive: {
    backgroundColor: '#eff6ff'
  },
  conversationAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    flexShrink: 0
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0
  },
  conversationTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem'
  },
  conversationName: {
    fontWeight: '600',
    fontSize: '0.875rem',
    color: '#111827'
  },
  conversationTime: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  conversationBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem'
  },
  conversationRole: {
    fontSize: '0.75rem',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '0.125rem 0.5rem',
    borderRadius: '4px'
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '0.75rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '10px',
    fontWeight: '600'
  },
  lastMessage: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white'
  },
  chatHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb'
  },
  chatHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  chatAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem'
  },
  chatName: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827'
  },
  chatRole: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: '#f9fafb'
  },
  emptyChat: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    color: '#6b7280'
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '0.5rem'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    wordWrap: 'break-word'
  },
  ownMessage: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderBottomRightRadius: '4px'
  },
  otherMessage: {
    backgroundColor: 'white',
    color: '#111827',
    border: '1px solid #e5e7eb',
    borderBottomLeftRadius: '4px'
  },
  messageContent: {
    margin: 0,
    marginBottom: '0.25rem',
    fontSize: '0.9375rem',
    lineHeight: '1.5'
  },
  messageTime: {
    fontSize: '0.75rem',
    opacity: 0.7
  },
  messageInputForm: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1.5rem',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: 'white'
  },
  messageInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '24px',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  sendButton: {
    width: '48px',
    height: '48px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  },
  noSelection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb'
  },
  noSelectionContent: {
    textAlign: 'center',
    color: '#6b7280'
  },
  noSelectionIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem'
  }
};

export default Messages;