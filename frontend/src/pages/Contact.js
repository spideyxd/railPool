import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', category: 'support', message: '' });
  const [status, setStatus] = useState('idle'); // idle, sending, sent

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate SMTP network call
    setTimeout(() => {
      setStatus('sent');
      setFormData({ name: '', email: '', category: 'support', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
        whileHover={{ x: -5 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to App</span>
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-500 mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Contact Administrators</h1>
          <p className="text-gray-600 dark:text-dark-400">Facing issues with a ride or user? Send us a securely logged message.</p>
        </div>

        {status === 'sent' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-700 dark:text-green-400 flex items-center justify-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Message delivered! Admins will reach out to you shortly.</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Your Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="input-field" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="input-field" placeholder="john@railpool.com" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Topic / Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field appearance-none">
              <option value="support">General Support</option>
              <option value="report">Report a User</option>
              <option value="feedback">Feedback & Suggestions</option>
              <option value="bug">Report a Bug / Glitch</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Message Reference</label>
            <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required className="input-field min-h-[150px] resize-y" placeholder="Describe your issue or query clearly here..." />
          </div>

          <motion.button type="submit" disabled={status === 'sending'} className="w-full btn-primary py-3 flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {status === 'sending' ? (
              <span className="animate-pulse">Delivering to Server...</span>
            ) : (
              <><Send className="w-5 h-5" /> Send Message</>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Contact;
