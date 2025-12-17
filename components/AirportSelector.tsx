'use client';

import { useState, useRef, useEffect } from 'react';
import { airportCodes } from '@/lib/airportCodes';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface AirportSelectorProps {
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  label: string;
}

export default function AirportSelector({ value, onChange, placeholder, label }: AirportSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>(airportCodes);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedAirport = airportCodes.find(airport => airport.code === value);

  useEffect(() => {
    const filtered = airportCodes.filter(airport =>
      airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAirports(filtered);
    setSelectedIndex(-1);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airport: Airport) => {
    onChange(airport.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputClick = () => {
    setIsOpen(true);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredAirports.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredAirports.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredAirports[selectedIndex]) {
          handleSelect(filteredAirports[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      <div 
        className="w-full px-3 py-2 border rounded cursor-pointer bg-white flex items-center justify-between"
        onClick={handleInputClick}
      >
        <span className={selectedAirport ? 'text-black' : 'text-gray-500'}>
          {selectedAirport 
            ? `${selectedAirport.code} - ${selectedAirport.name}, ${selectedAirport.city}`
            : placeholder
          }
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search airports..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredAirports.length > 0 ? (
              filteredAirports.map((airport, index) => (
                <div
                  key={airport.code}
                  className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                    index === selectedIndex ? 'bg-blue-100' : 'hover:bg-blue-50'
                  }`}
                  onClick={() => handleSelect(airport)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-bold text-blue-600 text-lg">{airport.code}</span>
                        <span className="ml-2 text-gray-900 font-medium">{airport.name}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {airport.city}, {airport.country}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ✈️
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-center">
                No airports found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}