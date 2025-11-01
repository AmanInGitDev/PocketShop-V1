/**
 * Vendor Onboarding Landing Page
 * 
 * This page serves as the main entry point for vendors to join PocketShop.
 * It's inspired by Zomato's design but with a more tech-focused approach.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './VendorOnboarding.css';

const VendorOnboarding: React.FC = () => {
  return (
    <div className="vendor-onboarding">
      {/* Header */}
      <header className="onboarding-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo">
                <span className="logo-icon">🛍️</span>
                <span className="logo-text">PocketShop</span>
              </div>
              <span className="tagline">— business partner —</span>
            </div>
            <Link to="/vendor/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Transform Your QR Code into a 
              <span className="highlight"> Smart Storefront</span>
            </h1>
            
            <p className="hero-subtitle">
              Join thousands of businesses using PocketShop to manage orders, 
              engage customers, and grow with AI-powered insights—all from a single QR code.
            </p>

            <div className="cta-section">
              <Link to="/vendor/register" className="btn btn-primary btn-xl">
                Join PocketShop
                <span className="btn-icon">→</span>
              </Link>
              
              <div className="trust-indicators">
                <div className="trust-item">
                  <span className="trust-icon">🛡️</span>
                  <span>Secure & Reliable</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">⚡</span>
                  <span>Setup in 5 minutes</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">👥</span>
                  <span>No app required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">
            Why should you partner with PocketShop?
          </h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">📱</span>
              </div>
              <h3 className="feature-title">App-Free Experience</h3>
              <p className="feature-description">
                Your customers can order and pay directly through their browser. 
                No downloads, no friction—just seamless ordering.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">📊</span>
              </div>
              <h3 className="feature-title">AI-Powered Analytics</h3>
              <p className="feature-description">
                Get insights into your best-selling items, peak hours, and customer 
                preferences to make smarter business decisions.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">👥</span>
              </div>
              <h3 className="feature-title">Real-Time Order Management</h3>
              <p className="feature-description">
                Manage all your orders with our intuitive Kanban dashboard. 
                Track orders from placement to completion effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="onboarding-footer">
        <div className="container">
          <div className="footer-content">
            <p className="footer-text">
              Questions? Contact us at{' '}
              <a href="mailto:support@pocketshop.com" className="footer-link">
                support@pocketshop.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VendorOnboarding;