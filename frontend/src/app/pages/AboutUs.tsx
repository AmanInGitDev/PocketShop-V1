/**
 * About Us Page Component
 * 
 * About page for PocketShop showcasing mission, problem, solution, and vision.
 * Features glassmorphism design consistent with the landing page.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Github } from 'lucide-react';
import Logo from '@/features/common/components/Logo';

// Team members data
const teamMembers = [
  { name: "Aman", role: "Project Lead / Full-Stack Developer", linkedin: "#", github: "#" },
  { name: "Prathamesh", role: "Frontend Specialist", linkedin: "#", github: "#" },
  { name: "Pratik", role: "Backend & Database", linkedin: "#", github: "#" },
  { name: "Vipul", role: "AI & Analytics", linkedin: "#", github: "#" },
  { name: "Pranav", role: "UI/UX Designer", linkedin: "#", github: "#" }
];

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-purple-900/10 backdrop-blur-[12px] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/">
              <Logo size="md" />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/business"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                Business
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Page Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-10">
            About Us
          </h1>

          {/* Hero Section - Our Mission */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 md:p-14 border border-white/20 mb-8 shadow-xl">
            <h2 className="text-3xl font-semibold text-white mb-5">
              Our Mission
            </h2>
            <p className="text-white/90 text-base leading-relaxed">
              We are transforming the humble QR code from a simple payment tool into a comprehensive virtual storefront and business intelligence platform. Our mission is to bridge the critical gap between basic payments and complex enterprise solutions, empowering even the smallest vendors with the data-driven tools they need to grow.
            </p>
          </div>

          {/* Our Story Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 md:p-14 border border-white/20 mb-8 shadow-xl">
            <h2 className="text-3xl font-semibold text-white mb-5">
              Our Story
            </h2>
            <p className="text-white/90 text-base leading-relaxed">
              PocketShop began as a final-year project for a team of five engineering students from D.Y. Patil College of Engineering, Kolhapur. We saw a gap: the local shops and cafes we loved were using QR codes, but only for payments. We saw the 'Static QR Paradox' firsthand—manual ordering, miscommunication, and vendors 'data-blind' in a digital world. We decided to build the solution. PocketShop is our answer to empower these local businesses with the same powerful tools as large corporations, starting with the QR code they already have.
            </p>
          </div>

          {/* Meet the Team Section */}
          <div className="mb-12 mt-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 text-center">
              Meet the Innovators
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl hover:bg-white/15 transition-colors text-center"
                >
                  {/* Profile Picture Placeholder */}
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Member Name */}
                  <h3 className="text-xl font-semibold text-white mt-4 mb-1">
                    {member.name}
                  </h3>
                  
                  {/* Role */}
                  <p className="text-white/60 text-sm mb-4">
                    {member.role}
                  </p>
                  
                  {/* Social Links */}
                  <div className="flex justify-center gap-4">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-pink-500 transition-colors"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-pink-500 transition-colors"
                      aria-label={`${member.name}'s GitHub`}
                    >
                      <Github className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The Problem and Our Solution - Side by Side */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* The Problem Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 md:p-14 border border-white/20 shadow-xl">
              <h2 className="text-3xl font-semibold text-white mb-5">
                The "Static QR Paradox"
              </h2>
              <p className="text-white/90 text-base leading-relaxed">
                In today's digital-first economy, most small businesses use QR codes for one thing: payments. This is a massive missed opportunity. It ignores all the inefficiencies in ordering and customer management, leaving customers with delays and vendors 'data-blind,' forced to rely on intuition rather than empirical evidence to make crucial business decisions.
              </p>
            </div>

            {/* Our Solution Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 md:p-14 border border-white/20 shadow-xl">
              <h2 className="text-3xl font-semibold text-white mb-5">
                The PocketShop Ecosystem
              </h2>
              <p className="text-white/90 text-base leading-relaxed mb-4">
                PocketShop resolves this paradox. We use Progressive Web Application (PWA) technology to provide a frictionless, app-less experience.
              </p>
              <div className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold text-pink-400 mb-2">
                    For Customers:
                  </h3>
                  <p className="text-white/90 text-base leading-relaxed">
                    A simple scan provides instant access to a digital menu for seamless ordering, payment, and real-time status tracking.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-pink-400 mb-2">
                    For Vendors:
                  </h3>
                  <p className="text-white/90 text-base leading-relaxed">
                    We provide a smart dashboard for live order management and a powerful AI-powered analytics engine to deliver actionable insights on sales trends, best-selling products, and peak hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Vision Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 md:p-14 border border-white/20 shadow-xl mb-8">
            <h2 className="text-3xl font-semibold text-white mb-5">
              Democratizing Digital Tools
            </h2>
            <p className="text-white/90 text-base leading-relaxed">
              We believe sophisticated digital tools shouldn't be reserved for large corporations. By building upon the QR code that vendors already understand, PocketShop democratizes access to technology, ensuring that even the smallest local cafe or food stall can enhance customer satisfaction and compete in the data-driven economy.
            </p>
          </div>

          {/* Our Home Base Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 md:p-14 border border-white/20 shadow-xl">
            <h2 className="text-3xl font-semibold text-white mb-5">
              Our Home Base
            </h2>
            <p className="text-white/90 text-base leading-relaxed mb-4">
              This project is proudly developed at:
            </p>
            <p className="text-white text-xl md:text-2xl font-semibold leading-relaxed">
              D.Y. Patil College of Engineering, Kolhapur
            </p>
            <p className="text-white/70 text-base mt-4 leading-relaxed">
              Kolhapur, Maharashtra, India
            </p>
          </div>
        </div>
      </main>

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
              
              {/* Social Media Icons */}
              <div className="flex gap-4 justify-center md:justify-start mb-8 md:mb-0">
                <a
                  href="#"
                  className="group transition-all duration-300 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
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
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg 
                    className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="group transition-all duration-300 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg 
                    className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="group transition-all duration-300 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg 
                    className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.487.535 6.624 0 11.99-5.367 11.99-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Platform</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/" 
                    className="footer-link group relative inline-block text-white/70 text-sm transition-all duration-300 hover:text-white"
                  >
                    <span className="relative z-10 inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:opacity-0">
                      Home
                    </span>
                    <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                      Home
                    </span>
                    <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/business" 
                    className="footer-link group relative inline-block text-white/70 text-sm transition-all duration-300 hover:text-white"
                  >
                    <span className="relative z-10 inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:opacity-0">
                      For Business
                    </span>
                    <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                      For Business
                    </span>
                    <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about-us" 
                    className="footer-link group relative inline-block text-white/70 text-sm transition-all duration-300 hover:text-white"
                  >
                    <span className="relative z-10 inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:opacity-0">
                      About Us
                    </span>
                    <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                      About Us
                    </span>
                    <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#" 
                    className="footer-link group relative inline-block text-white/70 text-sm transition-all duration-300 hover:text-white"
                  >
                    <span className="relative z-10 inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:opacity-0">
                      Blog
                    </span>
                    <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                      Blog
                    </span>
                    <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="footer-link group relative inline-block text-white/70 text-sm transition-all duration-300 hover:text-white"
                  >
                    <span className="relative z-10 inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:opacity-0">
                      Support
                    </span>
                    <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                      Support
                    </span>
                    <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="footer-link group relative inline-block text-white/70 text-sm transition-all duration-300 hover:text-white"
                  >
                    <span className="relative z-10 inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:opacity-0">
                      Documentation
                    </span>
                    <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                      Documentation
                    </span>
                    <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/about-us" 
                    className="footer-link group relative inline-block text-white/70 text-sm transition-all duration-300 hover:text-white"
                  >
                    <span className="relative z-10 inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:opacity-0">
                      About
                    </span>
                    <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                      About
                    </span>
                    <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="footer-link group relative inline-block text-white/70 text-sm transition-all duration-300 hover:text-white"
                  >
                    <span className="relative z-10 inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:opacity-0">
                      Privacy Policy
                    </span>
                    <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                      Privacy Policy
                    </span>
                    <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="footer-link group relative inline-block text-white/70 text-sm transition-all duration-300 hover:text-white"
                  >
                    <span className="relative z-10 inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:opacity-0">
                      Terms of Service
                    </span>
                    <span className="absolute left-0 top-0 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
                      Terms of Service
                    </span>
                    <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              </ul>
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

export default AboutUs;

