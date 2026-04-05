import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';

/**
 * Notification Toast Component with Context Provider
 * Manages global notifications across the app
 */

// Create notification context
const NotificationContext = React.createContext();

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const notification = { id, message, type };

    setNotifications((prev) => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

// Toast Container - displays all notifications
const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[999] space-y-2 max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => onRemove(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Individual Toast Item
const NotificationToast = ({ notification, onClose }) => {
  const { type, message } = notification;

  const typeConfig = {
    success: {
      colors: 'bg-green-500/10 border-green-500/30 text-green-400',
      icon: <Check className="w-5 h-5" />,
      bgColor: 'bg-green-500/20',
    },
    error: {
      colors: 'bg-red-500/10 border-red-500/30 text-red-400',
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-red-500/20',
    },
    info: {
      colors: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      icon: <Info className="w-5 h-5" />,
      bgColor: 'bg-blue-500/20',
    },
    warning: {
      colors: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-yellow-500/20',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 400, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg border flex items-start gap-3 shadow-lg backdrop-blur-md ${config.colors}`}
    >
      <div className="pt-0.5 flex-shrink-0">{config.icon}</div>

      <p className="text-sm font-medium flex-1 break-words">{message}</p>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </motion.button>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: 'linear' }}
        className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${config.bgColor}`}
      />
    </motion.div>
  );
};

export default NotificationToast;
