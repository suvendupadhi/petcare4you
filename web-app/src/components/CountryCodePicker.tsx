import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { countries, Country } from '../constants/countries';

interface CountryCodePickerProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  error?: boolean;
}

export default function CountryCodePicker({ selectedCountry, onSelect, error }: CountryCodePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.dialCode.includes(searchTerm)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-3 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} rounded-l-xl focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[100px] border-r-0`}
      >
        <span className="text-xl">{selectedCountry.flag}</span>
        <span className="text-sm font-semibold text-slate-700">{selectedCountry.dialCode}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 text-slate-400" size={16} />
              <input
                autoFocus
                type="text"
                placeholder="Search country..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={`${country.code}-${country.dialCode}`}
                type="button"
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors text-left"
                onClick={() => {
                  onSelect(country);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-sm text-slate-700">{country.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{country.dialCode}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
