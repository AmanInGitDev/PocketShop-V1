/**
 * PlacesAutocomplete Component
 * 
 * Uses Google Places Autocomplete API to provide place suggestions.
 * Requires Google Maps API key.
 */

import React, { useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

interface PlacesAutocompleteProps {
  onPlaceSelected: (place: { 
    address: string; 
    latitude: number; 
    longitude: number; 
    placeId?: string;
  }) => void;
  initialLocation?: { latitude: number; longitude: number };
  className?: string;
  placeholder?: string;
  isLoaded?: boolean;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelected,
  initialLocation,
  className = '',
  placeholder = 'Search for places, cuisines, and more...',
  isLoaded = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Check if Google Maps Places library is actually loaded
  const isPlacesLoaded = isLoaded && typeof google !== 'undefined' && 
    typeof google.maps !== 'undefined' && 
    typeof google.maps.places !== 'undefined';

  // Use the places autocomplete hook
  // The hook checks internally if google.maps.places is available
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: isPlacesLoaded ? {
      ...(initialLocation && {
        locationBias: `circle:50000@${initialLocation.latitude},${initialLocation.longitude}`
      }),
      componentRestrictions: { country: 'in' }, // Restrict to India
    } : undefined,
    debounce: 300,
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  // Handle place selection
  const handleSelect = async (suggestion: any) => {
    try {
      const results = await getGeocode({ address: suggestion.description });
      const { lat, lng } = await getLatLng(results[0]);
      
      const placeData = {
        address: suggestion.description,
        latitude: lat,
        longitude: lng,
        placeId: suggestion.place_id
      };
      
      setValue(suggestion.description, false);
      clearSuggestions();
      setShowSuggestions(false);
      onPlaceSelected(placeData);
    } catch (error) {
      console.error('Error selecting place:', error);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || data.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < data.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(data[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Show loading state - wait for Places library and hook to be ready
  if (!isPlacesLoaded || !ready) {
    return (
      <div className={`relative w-full ${className}`}>
        <input
          type="text"
          placeholder={placeholder}
          disabled
          className="w-full outline-none text-gray-700 placeholder-gray-400 text-base bg-gray-100"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        value={value || ''}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          // Delay to allow click events to fire
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        onKeyDown={handleKeyDown}
        disabled={!ready}
        placeholder={placeholder}
        className="w-full outline-none text-gray-700 placeholder-gray-400 text-base"
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && status === 'OK' && data.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {data.map((suggestion, index) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-purple-50'
                  : 'hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {suggestion.structured_formatting.main_text}
                  </p>
                  {suggestion.structured_formatting.secondary_text && (
                    <p className="text-sm text-gray-500">
                      {suggestion.structured_formatting.secondary_text}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {/* Show "no results" message */}
      {showSuggestions && status === 'ZERO_RESULTS' && value && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <li className="text-gray-500 text-center">
            No places found. Try a different search.
          </li>
        </ul>
      )}
    </div>
  );
};

export default PlacesAutocomplete;

