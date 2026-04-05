import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Train, ChevronDown, X, Check } from 'lucide-react';
import trainList from '../train number.json';

/**
 * TrainAutocomplete Component
 * Reusable train dropdown with search by number or name
 * Displays train number with name in bracket
 */
const TrainAutocomplete = ({
  value,
  onChange,
  placeholder = 'Select train...',
  className = '',
}) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Convert train list format [number, name] to objects
  const trains = trainList.map(([number, name]) => ({
    number,
    name,
  }));

  // Filter trains based on input
  useEffect(() => {
    if (!input.trim()) {
      setFilteredTrains([]);
      return;
    }

    const searchTerm = input.toLowerCase();
    const filtered = trains.filter(
      (train) =>
        train.name.toLowerCase().includes(searchTerm) ||
        train.number.toLowerCase().includes(searchTerm)
    );
    setFilteredTrains(filtered.slice(0, 15)); // Limit to 15 results
  }, [input]);

  // Load initial value if provided
  useEffect(() => {
    if (value) {
      const train = trains.find((t) => t.number === value || t.name === value);
      if (train) {
        setSelectedTrain(train);
        setInput(`${train.number} (${train.name})`);
      }
    }
  }, []);

  // Handle selection
  const handleSelect = (train) => {
    setSelectedTrain(train);
    setInput(`${train.number} (${train.name})`);
    setIsOpen(false);
    onChange({ number: train.number, name: train.name });
  };

  // Clear selection
  const handleClear = () => {
    setSelectedTrain(null);
    setInput('');
    setFilteredTrains([]);
    onChange(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="flex items-center gap-2 input-field p-0 pl-3 cursor-text hover:bg-dark-700/50 transition-colors">
          <Train className="w-4 h-4 text-dark-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => input && setIsOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          {selectedTrain && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-dark-600 rounded transition-colors flex-shrink-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <X className="w-4 h-4 text-dark-400" />
            </motion.button>
          )}
          <ChevronDown className={`w-4 h-4 text-dark-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {filteredTrains.length > 0 ? (
              filteredTrains.map((train, idx) => (
                <motion.button
                  key={`${train.number}-${idx}`}
                  onClick={() => handleSelect(train)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-dark-700 transition-colors flex items-center justify-between group ${
                    selectedTrain?.number === train.number ? 'bg-dark-700 border-l-2 border-primary-500' : ''
                  }`}
                  whileHover={{ paddingLeft: 18 }}
                >
                  <div className="flex-1">
                    <span className="font-semibold text-sm">{train.number}</span>
                    <span className="text-dark-400 text-sm ml-2">({train.name})</span>
                  </div>
                  {selectedTrain?.number === train.number && (
                    <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  )}
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-dark-400 text-sm">
                {input.trim() ? 'No trains found' : 'Start typing to search...'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainAutocomplete;
