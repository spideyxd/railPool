import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader } from 'lucide-react';
import { chatAPI } from '../services/api';

/**
 * ChatWindow - Real-time messaging between ride partners
 */
const ChatWindow = ({ rideRequestId, otherUser, rideIntent, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Load messages when modal opens
  useEffect(() => {
    if (isOpen && rideRequestId) {
      loadMessages();
      // Refresh messages every 3 seconds (polling for real-time effect)
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, rideRequestId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getMessages(rideRequestId);
      setMessages(response.data.messages);
      setError('');
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;

    setSending(true);
    setError('');

    try {
      const response = await chatAPI.sendMessage(rideRequestId, messageInput);
      setMessages([...messages, response.data.data]);
      setMessageInput('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-800">
          <div className="flex items-center gap-3">
            {otherUser?.avatar_url && (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary-500/30"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-white">{otherUser?.name}</p>
              {rideIntent && (
                <p className="text-xs text-dark-400">
                  {rideIntent.station} → {rideIntent.destination_name}
                </p>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-dark-400" />
          </motion.button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-950">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-dark-500 mb-2">No messages yet</p>
                <p className="text-dark-400 text-sm">Start a conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwn = msg.sender_id === currentUser.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    {!isOwn && msg.sender_avatar && (
                      <img
                        src={msg.sender_avatar}
                        alt={msg.sender_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-primary-500/20 text-primary-100 border border-primary-500/30'
                          : 'bg-dark-800 text-dark-100 border border-dark-700'
                      }`}
                    >
                      <p className="break-words text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-primary-400/60' : 'text-dark-500'}`}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 bg-red-500/10 border-t border-red-500/30 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-700 bg-dark-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="input-field flex-1"
            />
            <motion.button
              type="submit"
              disabled={sending || !messageInput.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary p-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ChatWindow;
