/**
 * LocationDetector Component
 * 
 * Uses browser Geolocation API to detect user's current location.
 * No external services required, works entirely in the browser.
 */

import { useState, forwardRef, useImperativeHandle } from 'react';

interface LocationDetectorProps {
  onLocationDetected: (location: { latitude: number; longitude: number; address?: string }) => void;
  className?: string;
}

export interface LocationDetectorRef {
  triggerDetection: () => void;
}

interface LocationState {
  latitude: number;
  longitude: number;
}

const LocationDetector = forwardRef<LocationDetectorRef, LocationDetectorProps>(({ 
  onLocationDetected, 
  className = '' 
}, ref) => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDetectLocation = () => {
    // Check if the Geolocation API is supported
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Clear previous state
    setLocation(null);
    setError(null);
    setIsLoading(true);

    // Get the current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setIsLoading(false);
        
        // Call the callback with the detected location
        onLocationDetected({ latitude, longitude });
        
        console.log("Location detected:", latitude, longitude);
      },
      (err) => {
        setIsLoading(false);
        
        // Handle different errors
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("You denied the request for Geolocation.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setError("The request to get user location timed out.");
            break;
          default:
            setError("An unknown error occurred.");
        }
      },
      {
        // Options for better accuracy
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Don't use cached position
      }
    );
  };

  // Expose the detection function via ref
  useImperativeHandle(ref, () => ({
    triggerDetection: handleDetectLocation,
  }));

  return (
    <button
      onClick={handleDetectLocation}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isLoading
          ? 'bg-gray-300 cursor-wait'
          : error
          ? 'bg-red-100 hover:bg-red-200 text-red-700'
          : location
          ? 'bg-green-100 hover:bg-green-200 text-green-700'
          : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
      } ${className}`}
      disabled={isLoading}
      title={
        isLoading
          ? 'Detecting location...'
          : error
          ? error
          : location
          ? `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
          : 'Click to detect your location'
      }
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Detecting...</span>
        </>
      ) : error ? (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Failed</span>
        </>
      ) : location ? (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Location Detected</span>
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
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
          <span>Detect Location</span>
        </>
      )}
    </button>
  );
});

LocationDetector.displayName = 'LocationDetector';

export default LocationDetector;

