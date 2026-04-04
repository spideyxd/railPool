import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, Loader, MessageSquare, CheckCheck } from 'lucide-react';
import { chatAPI, requestAPI } from '../services/api';

const Chat = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [requestDetails, setRequestDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    setSending(true);
    try {
      const response = await chatAPI.sendMessage(requestId, newMessage);
      setMessages([...messages, response.data.data]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const otherUser =
    requestDetails?.sender.id === currentUser?.id
      ? requestDetails?.receiver
      : requestDetails?.sender;

  const isAccepted = requestDetails?.request.status === 'accepted';

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-dark-950 transition-colors">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass backdrop-blur-xl border-b border-dark-800/50 px-4 sm:px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-900 dark:text-dark-400 dark:hover:text-white transition-colors -ml-2"
              whileHover={{ x: -3 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                {otherUser?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold">{otherUser?.name}</h2>
                <motion.p
                  className={`text-xs font-medium ${
                    isAccepted ? 'text-green-400' : 'text-yellow-400'
                  }`}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isAccepted ? '● Connected' : '● Pending'}
                </motion.p>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium"
            >
              Error: {error}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Messages Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-dark-950 to-dark-900"
      >
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-dark-800/50 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-dark-600" />
            </div>
            <p className="text-dark-400 mb-2">No messages yet</p>
            <p className="text-dark-500 text-sm">Start the conversation with {otherUser?.name}!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => {
              const isSent = msg.sender_id === currentUser?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      isSent
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-dark-100 border border-gray-200 dark:border-dark-700 rounded-bl-none'
                    }`}
                  >
                    <p className="break-words text-sm">{msg.content}</p>
                    <motion.p
                      className={`text-xs mt-2 flex items-center gap-1 ${
                        isSent ? 'text-primary-200' : 'text-dark-500'
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {isSent && <CheckCheck className="w-3 h-3" />}
                    </motion.p>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass backdrop-blur-xl border-t border-dark-800/50 p-4 sm:p-6"
      >
        {!isAccepted && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm flex items-start gap-2"
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Request is pending. You can chat once it's accepted.</span>
          </motion.div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isAccepted ? 'Type a message...' : 'Waiting for acceptance...'}
              disabled={!isAccepted || sending}
              className="input-field pr-4"
            />
          </div>
          <motion.button
            type="submit"
            disabled={!isAccepted || sending || !newMessage.trim()}
            className="btn-primary px-4 py-3 flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="hidden sm:inline-block">Send</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Chat;
