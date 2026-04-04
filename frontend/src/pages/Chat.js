import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatAPI, requestAPI } from '../services/api';
import '../styles/Chat.css';

const Chat = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestDetails, setRequestDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    loadData();
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const [messagesRes, detailsRes] = await Promise.all([
        chatAPI.getMessages(requestId),
        requestAPI.getRequestDetails(requestId),
      ]);
      setMessages(messagesRes.data.messages);
      setRequestDetails(detailsRes.data);
    } catch (err) {
      setError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await chatAPI.sendMessage(requestId, newMessage);
      setMessages([...messages, response.data.data]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  if (loading) return <div className="chat-container">Loading...</div>;

  const otherUser =
    requestDetails?.sender.id === currentUser?.id
      ? requestDetails?.receiver
      : requestDetails?.sender;

  return (
    <div className="chat-container">
      <nav className="navbar">
        <h1>RailPool - Chat</h1>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Back
        </button>
      </nav>

      <div className="chat-content">
        <div className="chat-header">
          <h3>Conversation with {otherUser?.name}</h3>
          <p>
            Status: <strong>{requestDetails?.request.status}</strong>
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="messages-container">
          {messages.length === 0 ? (
            <p className="empty-state">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.sender_id === currentUser?.id ? 'sent' : 'received'
                }`}
              >
                <p>{msg.content}</p>
                <small>{new Date(msg.created_at).toLocaleTimeString()}</small>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={requestDetails?.request.status !== 'accepted'}
          />
          <button
            type="submit"
            disabled={requestDetails?.request.status !== 'accepted'}
            className="btn-primary"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
