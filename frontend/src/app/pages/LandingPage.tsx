/**
 * Landing Page Component
 * 
 * Main landing page inspired by magicpin design with split Customer/Business view.
 * Features a modern design with dark blue/purple theme and city silhouettes.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useLoadScript } from '@react-google-maps/api';
import Logo from '@/features/common/components/Logo';
import LocationDetector, { LocationDetectorRef } from '@/features/common/components/LocationDetector';
import PlacesAutocomplete from '@/features/common/components/PlacesAutocomplete';

const Libraries: ("places")[] = ["places"];

const LandingPage: React.FC = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const desktopLocationBtnRef = useRef<LocationDetectorRef>(null);
  const mobileLocationBtnRef = useRef<LocationDetectorRef>(null);
  const [footerAccordions, setFooterAccordions] = useState({
    platform: false,
    resources: false,
    company: false,
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const navigate = useNavigate();

  // Load Google Maps script with Places library
  const { isLoaded: isMapsLoaded, loadError: mapsLoadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: Libraries
  });

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      // If deferredPrompt is not available, show a message or fallback
      alert('The app can be installed from your browser menu (usually in the address bar).');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  const handleBusinessClick = () => {
    // Take users to register so they sign up first; no redirect to onboarding without account
    navigate(ROUTES.REGISTER);
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(ROUTES.LOGIN);
  };

  // Handle location detection
  const handleLocationDetected = (location: { latitude: number; longitude: number; address?: string }) => {
    setUserLocation({ latitude: location.latitude, longitude: location.longitude });
    if (location.address) {
      setSearchLocation(location.address);
    } else {
      // Reverse geocode could be added here to get address from coordinates
      setSearchLocation(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
    }
  };

  // Handle place selection from autocomplete
  const handlePlaceSelected = (place: { address: string; latitude: number; longitude: number }) => {
    setSearchLocation(place.address);
    setUserLocation({ latitude: place.latitude, longitude: place.longitude });
  };

  // Handle Google Maps loading error
  if (mapsLoadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 flex items-center justify-center">
        <div className="text-white text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Error Loading Maps</h1>
          <p className="text-red-300 mb-4">Please check your API key configuration.</p>
          <p className="text-sm text-white/70">{mapsLoadError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 relative overflow-hidden">
      {/* Rich City Skyline Background with Labels */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 1400 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Building 1 - Fashion Store */}
          <rect x="50" y="550" width="100" height="350" fill="#6366f1" rx="4" />
          <rect x="70" y="570" width="60" height="80" fill="#818cf8" opacity="0.6" />
          <rect x="70" y="680" width="60" height="80" fill="#818cf8" opacity="0.6" />
          <text x="75" y="820" fill="#c4b5fd" fontSize="14" fontWeight="bold" transform="rotate(-90 75 820)">FASHION</text>
          
          {/* Building 2 - Restaurant */}
          <rect x="180" y="480" width="120" height="420" fill="#7c3aed" rx="4" />
          <rect x="200" y="500" width="30" height="40" fill="#a78bfa" opacity="0.7" />
          <rect x="245" y="500" width="30" height="40" fill="#a78bfa" opacity="0.7" />
          <rect x="200" y="560" width="30" height="40" fill="#a78bfa" opacity="0.7" />
          <rect x="245" y="560" width="30" height="40" fill="#a78bfa" opacity="0.7" />
          <text x="240" y="850" fill="#c4b5fd" fontSize="16" fontWeight="bold">RESTAURANT</text>
          
          {/* Building 3 - Gym */}
          <rect x="340" y="520" width="90" height="380" fill="#4f46e5" rx="4" />
          <rect x="355" y="540" width="60" height="100" fill="#6366f1" opacity="0.5" />
          <text x="365" y="850" fill="#c4b5fd" fontSize="14" fontWeight="bold">GOLD GYM</text>
          
          {/* Building 4 - Big Store */}
          <rect x="470" y="450" width="140" height="450" fill="#5b21b6" rx="4" />
          <rect x="490" y="470" width="40" height="50" fill="#8b5cf6" opacity="0.6" />
          <rect x="545" y="470" width="40" height="50" fill="#8b5cf6" opacity="0.6" />
          <rect x="600" y="470" width="40" height="50" fill="#8b5cf6" opacity="0.6" />
          <rect x="490" y="540" width="40" height="50" fill="#8b5cf6" opacity="0.6" />
          <rect x="545" y="540" width="40" height="50" fill="#8b5cf6" opacity="0.6" />
          <text x="535" y="840" fill="#c4b5fd" fontSize="18" fontWeight="bold">BIG MART</text>
          
          {/* Building 5 - Beauty Salon */}
          <rect x="650" y="580" width="80" height="320" fill="#6d28d9" rx="4" />
          <rect x="665" y="600" width="50" height="70" fill="#9333ea" opacity="0.6" />
          <text x="670" y="850" fill="#c4b5fd" fontSize="12" fontWeight="bold">BEAUTY</text>
          <text x="670" y="870" fill="#c4b5fd" fontSize="12" fontWeight="bold">SALON</text>
          
          {/* Building 6 - Medical */}
          <rect x="770" y="540" width="100" height="360" fill="#4338ca" rx="4" />
          <rect x="785" y="560" width="70" height="90" fill="#6366f1" opacity="0.5" />
          <text x="805" y="850" fill="#c4b5fd" fontSize="14" fontWeight="bold">MEDICARE</text>
          
          {/* Building 7 - Cafe */}
          <rect x="910" y="560" width="110" height="340" fill="#5b21b6" rx="4" />
          <rect x="930" y="580" width="35" height="45" fill="#8b5cf6" opacity="0.6" />
          <rect x="975" y="580" width="35" height="45" fill="#8b5cf6" opacity="0.6" />
          <text x="955" y="850" fill="#c4b5fd" fontSize="15" fontWeight="bold">CAFE</text>
          
          {/* Building 8 - Electronics */}
          <rect x="1060" y="500" width="130" height="400" fill="#4c1d95" rx="4" />
          <rect x="1080" y="520" width="45" height="55" fill="#7c3aed" opacity="0.6" />
          <rect x="1135" y="520" width="45" height="55" fill="#7c3aed" opacity="0.6" />
          <rect x="1080" y="590" width="45" height="55" fill="#7c3aed" opacity="0.6" />
          <text x="1115" y="840" fill="#c4b5fd" fontSize="16" fontWeight="bold">ELECTRONICS</text>
          
          {/* Additional smaller buildings for depth */}
          <rect x="1250" y="620" width="60" height="280" fill="#6366f1" rx="3" />
          <rect x="1330" y="600" width="70" height="300" fill="#7c3aed" rx="3" />
        </svg>
      </div>

      {/* Header - Magicpin Style: Clean and Simple */}
      <header className="fixed top-0 w-full z-50 bg-purple-900/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Top Bar - Logo and Sign In (Mobile First) */}
          <div className="flex items-center justify-between h-14 md:h-20 py-2">
            {/* Left Side - Logo */}
            <div className="flex items-center gap-2">
              <Logo size="md" />
              {/* Mobile Hamburger Menu - Only show on mobile, next to logo */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white/90 hover:text-white p-1.5"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Desktop Navigation Menu */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="/about-us"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                About us
              </a>
              <a
                href="#"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                Around you
              </a>
              <Link
                to="/business"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                For Business
              </Link>
            </nav>

            {/* Right Side - Sign In Button (Magicpin Style: Simple Pink Button) */}
            <button
              onClick={handleLoginClick}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg"
            >
              Sign In
            </button>
          </div>

          {/* Mobile Navigation Menu - Slide Down */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t border-white/10 animate-in slide-in-from-top duration-200">
              <div className="flex flex-col py-3 space-y-1">
                <a
                  href="/about-us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors px-4 py-2.5 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About us
                </a>
                <a
                  href="#"
                  className="text-white/90 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors px-4 py-2.5 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Around you
                </a>
                <Link
                  to="/business"
                  className="text-white/90 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors px-4 py-2.5 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Business
                </Link>
                <button
                  onClick={handleInstallApp}
                  className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors px-4 py-2.5 rounded-lg text-left"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App</span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section - Magicpin Style: Prominent Search */}
      <section className="relative z-10 pt-20 md:pt-24 pb-12 md:pb-16 lg:pt-28 lg:pb-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Main Headline - Better Mobile Spacing */}
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 md:mb-4 leading-tight">
              India's <span className="text-pink-500">1st</span> Offline Commerce
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white/90">
              Platform for Going Out
            </p>
          </div>

          {/* Unified Search Bar - Magicpin Style: Large and Prominent */}
          <div className="max-w-4xl mx-auto mb-8 md:mb-12">
            {/* Desktop Search Bar */}
            <div className="hidden md:flex bg-white rounded-2xl p-1.5 shadow-2xl items-center">
              {/* Location Section - Interactive with LocationDetector */}
              <div className="flex items-center gap-3 px-5 py-5 border-r border-gray-200">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div 
                  className="flex flex-col min-w-[140px] cursor-pointer" 
                  onClick={() => desktopLocationBtnRef.current?.triggerDetection()}
                >
                  <span className="text-xs text-gray-500">Location</span>
                  <span className="text-sm font-medium text-gray-700">
                    {searchLocation || 'Detect Location'}
                  </span>
                </div>
              </div>
              
              {/* Hidden LocationDetector for Desktop */}
              <div className="hidden">
                <LocationDetector
                  ref={desktopLocationBtnRef}
                  onLocationDetected={handleLocationDetected}
                />
              </div>
              
              {/* Main Search Input - Autocomplete */}
              <div className="flex items-center gap-3 px-5 py-5 flex-1">
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <PlacesAutocomplete
                  onPlaceSelected={handlePlaceSelected}
                  initialLocation={userLocation || undefined}
                  className="flex-1"
                  isLoaded={isMapsLoaded}
                />
              </div>
            </div>

            {/* Mobile Search Bar - Magicpin Style: Large, Clean, Prominent */}
            <div className="md:hidden bg-white rounded-xl p-4 shadow-2xl border border-gray-100">
              {/* Location Section - Top Row */}
              <div 
                className="flex items-center gap-2.5 px-2 py-2.5 mb-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 rounded-t-lg transition-colors"
                onClick={() => mobileLocationBtnRef.current?.triggerDetection()}
              >
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs text-gray-500 font-medium">Location</span>
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {searchLocation || 'Select Location'}
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* Hidden LocationDetector for Mobile */}
              <div className="hidden">
                <LocationDetector
                  ref={mobileLocationBtnRef}
                  onLocationDetected={handleLocationDetected}
                />
              </div>
              
              {/* Main Search Input - Autocomplete - Large and Prominent */}
              <div className="flex items-center gap-3 px-2">
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <PlacesAutocomplete
                  onPlaceSelected={handlePlaceSelected}
                  initialLocation={userLocation || undefined}
                  className="flex-1 text-base"
                  placeholder="Search for places, cuisines, and more..."
                  isLoaded={isMapsLoaded}
                />
              </div>
            </div>
          </div>

          {/* Category Cards - Magicpin Style: Better Mobile Spacing */}
          {/* Mobile: 2 columns, Desktop: 3 columns, Large: 6 columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 lg:gap-6 w-full max-w-7xl mx-auto mb-12 md:mb-16 px-3 sm:px-4 lg:px-8">
            {/* Fashion - Rich Magicpin-Style Illustration */}
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-110 flex flex-col">
              <div className="text-center mb-4">
                <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="bagGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="50%" stopColor="#f472b6" />
                        <stop offset="100%" stopColor="#be185d" />
                      </linearGradient>
                      <linearGradient id="standGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f3f4f6" />
                        <stop offset="100%" stopColor="#e5e7eb" />
                      </linearGradient>
                    </defs>
                    {/* Display Stand Base */}
                    <rect x="35" y="65" width="30" height="8" rx="4" fill="url(#standGradient)" stroke="#d1d5db" strokeWidth="1.5"/>
                    <rect x="38" y="60" width="24" height="5" rx="2" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1"/>
                    
                    {/* Shopping Bag on Stand - Rich Detail */}
                    <path d="M30 25 Q30 20 35 18 L65 18 Q70 20 70 25 L70 50 Q70 55 65 57 L35 57 Q30 55 30 50 Z" 
                          fill="url(#bagGradient2)" stroke="#be185d" strokeWidth="2"/>
                    <path d="M32 28 L68 28 L68 32 L32 32 Z" fill="#fce7f3" opacity="0.8"/>
                    <path d="M35 35 L65 35" stroke="#be185d" strokeWidth="1.5" opacity="0.5"/>
                    <path d="M35 42 L65 42" stroke="#be185d" strokeWidth="1.5" opacity="0.5"/>
                    
                    {/* Bag Handles with Dimension */}
                    <path d="M32 30 Q32 15 40 13 Q50 13 50 15" 
                          fill="none" stroke="#f472b6" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M50 15 Q50 13 60 13 Q68 15 68 30" 
                          fill="none" stroke="#f472b6" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M40 13 Q50 13 60 13" stroke="#ec4899" strokeWidth="2" fill="none"/>
                    
                    {/* High Heel Shoe - Detailed */}
                    <path d="M15 55 L20 55 L22 68 L28 72 L32 68 L32 62 L30 58" 
                          fill="#ec4899" stroke="#be185d" strokeWidth="2"/>
                    <ellipse cx="25" cy="63" rx="4" ry="3" fill="#be185d"/>
                    <path d="M18 56 L20 56" stroke="#be185d" strokeWidth="1"/>
                    
                    {/* Small Handbag Accessory */}
                    <path d="M75 20 L78 22 L78 28 L75 30 L72 28 L72 22 Z" 
                          fill="#f472b6" stroke="#ec4899" strokeWidth="1.5"/>
                    <circle cx="75" cy="25" r="1.5" fill="#be185d"/>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[9px] md:text-[10px] text-gray-600 mb-1 font-normal uppercase tracking-wide">SHOP LOCAL</p>
                <p className="font-bold text-gray-900 text-sm md:text-base">Fashion</p>
              </div>
            </div>

            {/* Salon - Rich Magicpin-Style Salon Scene */}
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-110 flex flex-col">
              <div className="text-center mb-4">
                <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="scissorGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="50%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    {/* Professional Scissors - Detailed */}
                    <path d="M18 22 L28 32 M28 22 L18 32" 
                          stroke="url(#scissorGradient2)" strokeWidth="5" strokeLinecap="round"/>
                    <circle cx="18" cy="22" r="5" fill="#6366f1" stroke="#4f46e5" strokeWidth="2"/>
                    <circle cx="28" cy="32" r="5" fill="#6366f1" stroke="#4f46e5" strokeWidth="2"/>
                    <circle cx="18" cy="22" r="2.5" fill="#c4b5fd"/>
                    <circle cx="28" cy="32" r="2.5" fill="#c4b5fd"/>
                    
                    {/* Hair Dryer - More Detailed */}
                    <ellipse cx="55" cy="22" rx="10" ry="6" fill="#a78bfa" stroke="#7c3aed" strokeWidth="2"/>
                    <rect x="50" y="20" width="12" height="5" rx="2.5" fill="#c4b5fd"/>
                    <path d="M62 22 L68 26 L66 30 L60 26 Z" fill="#9333ea"/>
                    <circle cx="55" cy="22" r="2" fill="#6366f1"/>
                    {/* Air flow lines */}
                    <path d="M68 22 L72 22 M68 26 L72 26" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round"/>
                    
                    {/* Professional Comb - Detailed */}
                    <rect x="32" y="48" width="3" height="18" rx="1.5" fill="#818cf8" stroke="#6366f1" strokeWidth="1.5"/>
                    <path d="M32 52 L40 56 M33 57 L41 61 M34 62 L42 66" 
                          stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
                    
                    {/* Hair Clipper */}
                    <rect x="60" y="45" width="12" height="6" rx="3" fill="#4f46e5" stroke="#4338ca" strokeWidth="1.5"/>
                    <rect x="62" y="47" width="8" height="2" fill="#818cf8"/>
                    <rect x="58" y="46" width="3" height="4" rx="1.5" fill="#6366f1"/>
                    
                    {/* Styling Brush */}
                    <ellipse cx="20" cy="55" rx="4" ry="6" fill="#a78bfa" stroke="#7c3aed" strokeWidth="1.5"/>
                    <path d="M18 52 L22 52 M18 55 L22 55 M18 58 L22 58" 
                          stroke="#6366f1" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[9px] md:text-[10px] text-gray-600 mb-1 font-normal uppercase tracking-wide">FIND SERVICES</p>
                <p className="font-bold text-gray-900 text-sm md:text-base">Salons</p>
              </div>
            </div>

            {/* Quick Bites - Rich Magicpin-Style Meal Illustration */}
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-110 flex flex-col">
              <div className="text-center mb-4">
                <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="bowlGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef3c7" />
                        <stop offset="50%" stopColor="#fde68a" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                      <linearGradient id="curryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#dc2626" />
                        <stop offset="100%" stopColor="#b91c1c" />
                      </linearGradient>
                    </defs>
                    {/* Bowl - More Realistic */}
                    <ellipse cx="45" cy="65" rx="28" ry="9" fill="#f59e0b" stroke="#d97706" strokeWidth="2.5"/>
                    <path d="M20 58 Q20 50 30 46 Q40 40 45 40 Q50 40 60 46 Q70 50 70 58" 
                          fill="url(#bowlGradient2)" stroke="#d97706" strokeWidth="2.5"/>
                    {/* Rich Curry/Soup in Bowl */}
                    <ellipse cx="40" cy="52" rx="12" ry="7" fill="url(#curryGradient)" opacity="0.9"/>
                    <ellipse cx="52" cy="54" rx="9" ry="6" fill="#ea580c" opacity="0.9"/>
                    <ellipse cx="35" cy="48" rx="6" ry="4" fill="#f59e0b" opacity="0.8"/>
                    {/* Floating ingredients */}
                    <circle cx="45" cy="46" r="2.5" fill="#fbbf24"/>
                    <circle cx="50" cy="50" r="2" fill="#84cc16"/>
                    <circle cx="38" cy="52" r="2" fill="#f97316"/>
                    
                    {/* Lime Wedge - Detailed */}
                    <circle cx="15" cy="38" r="6" fill="#84cc16" stroke="#65a30d" strokeWidth="2"/>
                    <path d="M12 36 L18 40 M18 36 L12 40" stroke="#65a30d" strokeWidth="2"/>
                    <path d="M15 34 L15 42" stroke="#65a30d" strokeWidth="1.5"/>
                    
                    {/* Drink Glass - More Detailed */}
                    <path d="M68 18 L64 48 Q64 54 69 54 Q74 54 74 48 L70 18 Q70 16 69 16 Q68 16 68 18" 
                          fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                    <ellipse cx="69" cy="18" rx="3" ry="2" fill="#fbbf24" opacity="0.6"/>
                    <ellipse cx="69" cy="25" rx="2" ry="1.5" fill="#fbbf24" opacity="0.4"/>
                    <path d="M66 22 L72 22" stroke="#f59e0b" strokeWidth="1"/>
                    
                    {/* Crackers/Bread */}
                    <ellipse cx="20" cy="68" rx="6" ry="3" fill="#d97706" opacity="0.8"/>
                    <ellipse cx="24" cy="70" rx="5" ry="2.5" fill="#f59e0b" opacity="0.7"/>
                    <path d="M18 68 L26 68" stroke="#d97706" strokeWidth="1"/>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[9px] md:text-[10px] text-gray-600 mb-1 font-normal uppercase tracking-wide">EAT LOCAL</p>
                <p className="font-bold text-gray-900 text-sm md:text-base">Quick Bites</p>
              </div>
            </div>

            {/* Medicare - Rich Magicpin-Style Medical Scene */}
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-110 flex flex-col">
              <div className="text-center mb-4">
                <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="medicalGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#5eead4" />
                        <stop offset="50%" stopColor="#2dd4bf" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                      <radialGradient id="medicalGlow2" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                        <stop offset="70%" stopColor="#14b8a6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.05" />
                      </radialGradient>
                    </defs>
                    {/* Medical Cross - Prominent & Detailed */}
                    <circle cx="45" cy="45" r="32" fill="url(#medicalGlow2)"/>
                    <rect x="42" y="15" width="10" height="50" rx="5" fill="url(#medicalGradient2)" 
                          stroke="#0d9488" strokeWidth="2"/>
                    <rect x="15" y="42" width="60" height="10" rx="5" fill="url(#medicalGradient2)" 
                          stroke="#0d9488" strokeWidth="2"/>
                    <circle cx="45" cy="45" r="5" fill="#ffffff"/>
                    <circle cx="45" cy="45" r="3" fill="#2dd4bf" opacity="0.5"/>
                    
                    {/* Medicine Pills - Multiple & Detailed */}
                    <ellipse cx="68" cy="22" rx="6" ry="4" fill="#2dd4bf" stroke="#14b8a6" strokeWidth="1.5"/>
                    <line x1="64" y1="22" x2="72" y2="22" stroke="#0d9488" strokeWidth="1.5"/>
                    <ellipse cx="72" cy="30" rx="5" ry="3" fill="#5eead4" stroke="#14b8a6" strokeWidth="1.5"/>
                    <line x1="69" y1="30" x2="75" y2="30" stroke="#0d9488" strokeWidth="1"/>
                    
                    {/* Medical Kit/Box */}
                    <rect x="18" y="20" width="12" height="10" rx="2" fill="#ecfeff" stroke="#14b8a6" strokeWidth="1.5"/>
                    <path d="M18 20 L24 16 L30 20" fill="#ecfeff" stroke="#14b8a6" strokeWidth="1.5"/>
                    <line x1="22" y1="20" x2="22" y2="30" stroke="#14b8a6" strokeWidth="1"/>
                    <line x1="26" y1="20" x2="26" y2="30" stroke="#14b8a6" strokeWidth="1"/>
                    
                    {/* Heartbeat Line */}
                    <path d="M20 62 L24 62 L26 58 L28 66 L30 62 L34 62" 
                          stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <circle cx="24" cy="62" r="1.5" fill="#ef4444"/>
                    <circle cx="30" cy="62" r="1.5" fill="#ef4444"/>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[9px] md:text-[10px] text-gray-600 mb-1 font-normal uppercase tracking-wide">LOCAL ESSENTIALS</p>
                <p className="font-bold text-gray-900 text-sm md:text-base">Medicare</p>
              </div>
            </div>

            {/* Fine Dining - Rich Magicpin-Style Elegant Plate */}
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-110 flex flex-col">
              <div className="text-center mb-4">
                <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="plateGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="50%" stopColor="#faf5ff" />
                        <stop offset="100%" stopColor="#e9d5ff" />
                      </linearGradient>
                      <linearGradient id="wineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#991b1b" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.9" />
                      </linearGradient>
                    </defs>
                    {/* Elegant Plate - More Realistic */}
                    <ellipse cx="45" cy="70" rx="32" ry="10" fill="#c4b5fd" stroke="#9333ea" strokeWidth="2.5"/>
                    <circle cx="45" cy="55" r="28" fill="url(#plateGradient2)" stroke="#9333ea" strokeWidth="3"/>
                    {/* Rim detail */}
                    <ellipse cx="45" cy="30" rx="26" ry="4" fill="#faf5ff" stroke="#c4b5fd" strokeWidth="1"/>
                    
                    {/* Gourmet Food Presentation - Rich Detail */}
                    <ellipse cx="38" cy="48" rx="14" ry="8" fill="#a855f7" opacity="0.85"/>
                    <ellipse cx="52" cy="50" rx="11" ry="7" fill="#7c3aed" opacity="0.8"/>
                    <ellipse cx="45" cy="45" rx="8" ry="5" fill="#6d28d9" opacity="0.9"/>
                    {/* Sauce/drizzle detail */}
                    <path d="M30 46 Q38 44 45 46 Q52 48 58 50" 
                          stroke="#6d28d9" strokeWidth="3" fill="none" opacity="0.7"/>
                    {/* Garnish - Fresh Herbs & Lemon */}
                    <circle cx="25" cy="42" r="3" fill="#84cc16"/>
                    <path d="M24 40 L26 44 M26 40 L24 44" stroke="#65a30d" strokeWidth="1"/>
                    <circle cx="58" cy="46" r="3" fill="#fbbf24"/>
                    <path d="M57 44 L59 48 M59 44 L57 48" stroke="#f59e0b" strokeWidth="1"/>
                    <circle cx="50" cy="38" r="2.5" fill="#fde047"/>
                    
                    {/* Wine Glass - Elegant & Detailed */}
                    <path d="M70 12 L66 58 Q66 64 71 64 Q76 64 76 58 L72 12 Q72 10 71 10 Q70 10 70 12" 
                          fill="#fef2f2" stroke="#dc2626" strokeWidth="2.5"/>
                    {/* Wine liquid */}
                    <path d="M66 42 Q66 45 68 45 Q70 45 70 42 L70 25 Q70 22 68 22 Q66 22 66 25 Z" 
                          fill="url(#wineGradient)"/>
                    <ellipse cx="71" cy="12" rx="3.5" ry="2" fill="#dc2626" opacity="0.4"/>
                    <ellipse cx="71" cy="18" rx="2.5" ry="1.5" fill="#dc2626" opacity="0.3"/>
                    <ellipse cx="71" cy="24" rx="2" ry="1" fill="#dc2626" opacity="0.2"/>
                    <path d="M68 28 L74 28" stroke="#dc2626" strokeWidth="1.5" opacity="0.6"/>
                    
                    {/* Fork Detail */}
                    <rect x="15" y="52" width="2" height="12" rx="1" fill="#c4b5fd" stroke="#9333ea" strokeWidth="1"/>
                    <path d="M15 52 L15 48 L16 48 L16 52 M15 56 L15 60 L16 60 L16 56" 
                          stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[9px] md:text-[10px] text-gray-600 mb-1 font-normal uppercase tracking-wide">DINE OUT</p>
                <p className="font-bold text-gray-900 text-sm md:text-base">Fine Dining</p>
              </div>
            </div>

            {/* Local Stores - Rich Magicpin-Style Store Scene */}
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-110 flex flex-col">
              <div className="text-center mb-4">
                <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="mapGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef3c7" />
                        <stop offset="50%" stopColor="#fde68a" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>
                    {/* Map - Rich Detail */}
                    <rect x="10" y="15" width="70" height="60" rx="5" fill="url(#mapGradient2)" 
                          stroke="#f59e0b" strokeWidth="3"/>
                    {/* Folded corner with shadow */}
                    <path d="M80 15 L80 25 L70 15 Z" fill="#fbbf24" opacity="0.7"/>
                    <path d="M77 15 L77 22 L70 15" stroke="#d97706" strokeWidth="1"/>
                    
                    {/* Road Network */}
                    <path d="M15 35 L35 40 L50 28 L65 38" 
                          stroke="#f59e0b" strokeWidth="3" fill="none" strokeDasharray="4,4"/>
                    <path d="M20 50 L45 45 L70 52" 
                          stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeDasharray="3,3"/>
                    
                    {/* Building Shapes on Map */}
                    <rect x="18" y="25" width="8" height="6" rx="1" fill="#d97706" opacity="0.4"/>
                    <rect x="45" y="20" width="10" height="7" rx="1" fill="#d97706" opacity="0.4"/>
                    <rect x="60" y="32" width="7" height="5" rx="1" fill="#d97706" opacity="0.4"/>
                    
                    {/* Location Pins - Colorful & Detailed */}
                    <g>
                      <ellipse cx="25" cy="42" rx="5" ry="2.5" fill="#ef4444" opacity="0.4"/>
                      <circle cx="25" cy="42" r="5" fill="#ef4444"/>
                      <circle cx="25" cy="42" r="2.5" fill="#ffffff"/>
                      <circle cx="25" cy="38" r="1.5" fill="#ef4444"/>
                      <path d="M25 47 L25 52 L23 52 M25 47 L27 52" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
                    </g>
                    <g>
                      <ellipse cx="48" cy="38" rx="5" ry="2.5" fill="#3b82f6" opacity="0.4"/>
                      <circle cx="48" cy="38" r="5" fill="#3b82f6"/>
                      <circle cx="48" cy="38" r="2.5" fill="#ffffff"/>
                      <circle cx="48" cy="34" r="1.5" fill="#3b82f6"/>
                      <path d="M48 43 L48 48 L46 48 M48 43 L50 48" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                    </g>
                    <g>
                      <ellipse cx="38" cy="52" rx="5" ry="2.5" fill="#10b981" opacity="0.4"/>
                      <circle cx="38" cy="52" r="5" fill="#10b981"/>
                      <circle cx="38" cy="52" r="2.5" fill="#ffffff"/>
                      <circle cx="38" cy="48" r="1.5" fill="#10b981"/>
                      <path d="M38 57 L38 62 L36 62 M38 57 L40 62" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
                    </g>
                    <g>
                      <ellipse cx="62" cy="48" rx="4" ry="2" fill="#f59e0b" opacity="0.4"/>
                      <circle cx="62" cy="48" r="4" fill="#f59e0b"/>
                      <circle cx="62" cy="48" r="2" fill="#ffffff"/>
                    </g>
                    
                    {/* Compass Rose */}
                    <circle cx="70" cy="25" r="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5"/>
                    <path d="M70 19 L72 23 L68 23 Z" fill="#ef4444"/>
                    <path d="M70 31 L72 27 L68 27 Z" fill="#ef4444"/>
                    <path d="M64 25 L68 23 L68 27 Z" fill="#3b82f6"/>
                    <path d="M76 25 L72 23 L72 27 Z" fill="#3b82f6"/>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[9px] md:text-[10px] text-gray-600 mb-1 font-normal uppercase tracking-wide">DISCOVER MORE</p>
                <p className="font-bold text-gray-900 text-sm md:text-base">Local Stores</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smooth Curve Separator */}
      <div className="relative z-10 -mt-16">
        <svg
          className="w-full h-20"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0 C240 100 480 50 720 40 C960 30 1200 70 1440 0 L1440 100 L0 100 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Promotional Banner Section */}
      <section className="relative z-10 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 border-2 border-purple-100 shadow-xl">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-8 items-center">
              {/* Left - Partner Logo/Brand */}
              <div className="text-center md:text-left order-1 md:order-1">
                <div className="inline-block bg-white rounded-2xl p-3 shadow-md mb-3">
                  {/* Partner Logo Placeholder - Replace with actual partner logo */}
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg md:text-xl font-bold">RB</span>
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">Restaurant Brand</h3>
                <p className="text-gray-600 text-xs md:text-sm">Partner Restaurant</p>
              </div>

              {/* Center - Offer (Hero) */}
              <div className="text-center order-2 md:order-2">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-2 leading-tight">
                  Flat <span className="text-pink-600">₹200</span> off
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">
                  on purchase above ₹1,999
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 mx-auto">
                  Explore now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Split View - Customer & Business Sections */}
      <section className="relative z-10 py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Customer Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 flex flex-col">
              <div className="mb-6">
                <span className="text-purple-300 text-sm font-semibold uppercase tracking-wide">
                  Customer Section
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-white mt-2 leading-tight">
                  Find Amazing Local Deals!
                </h2>
              </div>

              {/* Customer Icon */}
              <div className="w-20 h-20 mb-6 bg-purple-500/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              {/* Customer Benefits */}
              <ul className="space-y-3 flex-1">
                <li className="flex items-center text-white/90">
                  <span className="text-purple-400 mr-3">•</span>
                  Exclusive Offers
                </li>
                <li className="flex items-center text-white/90">
                  <span className="text-purple-400 mr-3">•</span>
                  Cashback Rewards
                </li>
                <li className="flex items-center text-white/90">
                  <span className="text-purple-400 mr-3">•</span>
                  Easy Discovery
                </li>
              </ul>

              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mt-8 w-full">
                Start Shopping
              </button>
            </div>

            {/* Business Section */}
            <div className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 backdrop-blur-md rounded-2xl p-8 border border-purple-400/30 flex flex-col">
              <div className="mb-6">
                <span className="text-purple-200 text-sm font-semibold uppercase tracking-wide">
                  Business Section
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-white mt-2 leading-tight">
                  Grow Your Local Business!
                </h2>
              </div>

              {/* Business Icon - Storefront/Growth Icon */}
              <div className="w-20 h-20 mb-6 bg-purple-400/40 rounded-lg flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>

              {/* Business Features */}
              <ul className="space-y-3 flex-1">
                <li className="flex items-center text-white/90">
                  <span className="text-purple-200 mr-3">•</span>
                  Reach More Customers
                </li>
                <li className="flex items-center text-white/90">
                  <span className="text-purple-200 mr-3">•</span>
                  Targeted Ads
                </li>
                <li className="flex items-center text-white/90">
                  <span className="text-purple-200 mr-3">•</span>
                  Sales Tracking
                </li>
              </ul>

              <button
                onClick={handleBusinessClick}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full mt-8"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/60 backdrop-blur-md border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
            {/* Left Section - Brand Info */}
            <div className="lg:col-span-2">
              <Logo size="lg" />
              <p className="text-white/80 text-lg font-medium mt-4 mb-3">
                Discover Local, Shop Offline
              </p>
              <p className="text-white/60 text-sm leading-relaxed max-w-md mb-6">
                Discover local deals, explore nearby stores, and shop offline. 
                All powered by our innovative QR platform.
              </p>
              
              {/* Social Media Icons - No Dark Boxes */}
              <div className="flex gap-4 justify-center md:justify-start mb-8 md:mb-0">
                <a
                  href="#"
                  className="group transition-all duration-300 hover:scale-110"
                >
                  <svg 
                    className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="group transition-all duration-300 hover:scale-110"
                >
                  <svg 
                    className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.317 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="group transition-all duration-300 hover:scale-110"
                >
                  <svg 
                    className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Section - Navigation Links */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 md:mt-0">
              {/* Platform */}
              <div>
                <button
                  onClick={() => setFooterAccordions(prev => ({ ...prev, platform: !prev.platform }))}
                  className="md:pointer-events-none w-full md:w-auto flex items-center justify-between md:justify-start mb-4"
                >
                  <h4 className="text-white font-bold text-sm uppercase tracking-wide relative inline-block">
                    Platform
                    <span className="hidden md:block absolute bottom-0 left-0 w-full h-0.5 bg-pink-500"></span>
                  </h4>
                  <svg 
                    className={`md:hidden w-5 h-5 text-white transition-transform ${footerAccordions.platform ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <ul className={`space-y-3 mt-6 ${footerAccordions.platform ? 'block' : 'hidden md:block'}`}>
                  <li>
                    <a 
                      href="#" 
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        Local Stores
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        Local Stores
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        Nearby Deals
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        Nearby Deals
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        Categories
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        Categories
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        QR Scanner
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        QR Scanner
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <button
                  onClick={() => setFooterAccordions(prev => ({ ...prev, resources: !prev.resources }))}
                  className="md:pointer-events-none w-full md:w-auto flex items-center justify-between md:justify-start mb-4"
                >
                  <h4 className="text-white font-bold text-sm uppercase tracking-wide relative inline-block">
                    Resources
                    <span className="hidden md:block absolute bottom-0 left-0 w-full h-0.5 bg-pink-500"></span>
                  </h4>
                  <svg 
                    className={`md:hidden w-5 h-5 text-white transition-transform ${footerAccordions.resources ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <ul className={`space-y-3 mt-6 ${footerAccordions.resources ? 'block' : 'hidden md:block'}`}>
                  <li>
                    <a 
                      href="#" 
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        Help Center
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        Help Center
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        Documentation
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        Documentation
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        Blog
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        Blog
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        Community
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        Community
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <button
                  onClick={() => setFooterAccordions(prev => ({ ...prev, company: !prev.company }))}
                  className="md:pointer-events-none w-full md:w-auto flex items-center justify-between md:justify-start mb-4"
                >
                  <h4 className="text-white font-bold text-sm uppercase tracking-wide relative inline-block">
                    Company
                    <span className="hidden md:block absolute bottom-0 left-0 w-full h-0.5 bg-pink-500"></span>
                  </h4>
                  <svg 
                    className={`md:hidden w-5 h-5 text-white transition-transform ${footerAccordions.company ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <ul className={`space-y-3 mt-6 ${footerAccordions.company ? 'block' : 'hidden md:block'}`}>
                  <li>
                    <Link
                      to="/business"
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        For Business
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        For Business
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                  <li>
                    <a 
                      href="/about-us"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        About Us
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        About Us
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        Privacy Policy
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        Privacy Policy
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="footer-link group relative inline-block text-white/70 text-sm
                                 transition-all duration-300 hover:text-white"
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 
                                       group-hover:-translate-y-1 group-hover:opacity-0">
                        Terms of Service
                      </span>
                      <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 
                                       group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                        Terms of Service
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 
                                       transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Section */}
          <div className="border-t border-white/10 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/60 text-sm text-center md:text-left mb-4 md:mb-0">
                © 2025 PocketShop. All rights reserved.
              </p>
              <p className="text-white/60 text-sm text-center md:text-right">
                Made with <span className="text-pink-500">❤️</span> for local businesses
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

