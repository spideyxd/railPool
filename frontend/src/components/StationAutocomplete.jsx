import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, X, Check } from 'lucide-react';
import stationList from '../stationList.json';

/**
 * StationAutocomplete Component
 * Reusable station dropdown with search by name or code
 * Displays all stations with autocomplete functionality
 */
const StationAutocomplete = ({
  value,
  onChange,
  placeholder = 'Select station...',
  className = '',
}) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Convert station list format [code, name] to objects
  const stations = stationList.map(([code, name]) => ({
    code,
    name,
  }));

  // Filter stations based on input
  useEffect(() => {
    if (!input.trim()) {
      setFilteredStations([]);
      return;
    }

    const searchTerm = input.toLowerCase();
    const filtered = stations.filter(
      (station) =>
        station.name.toLowerCase().includes(searchTerm) ||
        station.code.toLowerCase().includes(searchTerm)
    );
    setFilteredStations(filtered.slice(0, 10)); // Limit to 10 results
  }, [input]);

  // Load initial value if provided
  useEffect(() => {
    if (value) {
      const station = stations.find((s) => s.code === value || s.name === value);
      if (station) {
        setSelectedStation(station);
        setInput(`${station.name} (${station.code})`);
      }
    }
  }, [value]);

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

  const handleSelect = (station) => {
    setSelectedStation(station);
    setInput(`${station.name} (${station.code})`);
    setIsOpen(false);
    onChange({
      code: station.code,
      name: station.name,
    });
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInput('');
    setSelectedStation(null);
    setFilteredStations([]);
    setIsOpen(false);
    onChange(null);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setIsOpen(true);
    setSelectedStation(null);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="font-bold text-primary-400">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-dark-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={() => {
            if (input.trim()) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="input-field pl-10 pr-10"
          autoComplete="off"
        />
        
        {/* Clear Button */}
        {input && (
          <motion.button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-3.5 text-dark-500 hover:text-dark-300 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}

        {/* Dropdown Arrow */}
        {!input && (
          <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-dark-500 pointer-events-none" />
        )}
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
          >
            {filteredStations.length === 0 ? (
              <div className="p-4 text-center text-dark-400 text-sm">
                {input.trim() ? 'No stations found' : 'Start typing to search...'}
              </div>
            ) : (
              <div className="py-1">
                {filteredStations.map((station, index) => (
                  <motion.button
                    key={`${station.code}-${index}`}
                    type="button"
                    onClick={() => handleSelect(station)}
                    className="w-full text-left px-4 py-3 hover:bg-primary-500/10 transition-colors flex items-center gap-3 border-b border-dark-700/50 last:border-b-0"
                    whileHover={{ paddingLeft: 20 }}
                  >
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-dark-200 font-medium">
                        {highlightMatch(station.name, input)}
                      </p>
                      <p className="text-xs text-dark-500">
                        Code: {highlightMatch(station.code, input)}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Station Badge */}
      {selectedStation && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 px-3 py-2 bg-primary-500/10 border border-primary-500/30 rounded-lg flex items-center justify-between gap-2"
        >
          <div>
            <p className="text-xs text-dark-500 font-medium">Selected Station</p>
            <p className="text-sm text-primary-400 font-medium">
              {selectedStation.name} ({selectedStation.code})
            </p>
          </div>
          <Check className="w-4 h-4 text-green-500" />
        </motion.div>
      )}
    </div>
  );
};

export default StationAutocomplete;
