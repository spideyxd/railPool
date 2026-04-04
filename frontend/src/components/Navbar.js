import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, LogOut, Sun, Moon, Mail } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Default dark mode since the standard railpool was dark 
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : true
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Don't show full navbar on auth screens
  if (['/login', '/signup'].includes(location.pathname)) {
    return null; 
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain drop-shadow" />
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RailPool</h1>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user.name && (
            <div className="hidden md:block mr-2">
              <span className="text-sm font-medium text-gray-700 dark:text-dark-300">Welcome, {user.name}</span>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark(!isDark)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/contact')}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
            title="Contact Admin"
          >
            <Mail className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/search')}
            className="hidden sm:flex btn-primary gap-2 items-center"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="btn-ghost gap-2 flex items-center"
          >
            <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
