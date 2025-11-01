import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import VendorLogin from './pages/VendorLogin';
import VendorRegister from './pages/VendorRegister';
import VendorOnboarding from './pages/VendorOnboarding';
import VendorOnboardingFlow from './pages/VendorOnboardingFlow';
import VendorDashboard from './pages/VendorDashboard';

// Landing Page Component
function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: `
        linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(51, 65, 85, 0.9) 100%),
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%233b82f6" stop-opacity="0.1"/><stop offset="100%" stop-color="%231d4ed8" stop-opacity="0.05"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23a)"/></svg>')
      `,
      backgroundSize: 'cover, 100% 100%',
      backgroundPosition: 'center, center',
      backgroundAttachment: 'fixed',
      padding: '0',
      margin: '0',
      fontFamily: 'Inter, system-ui, sans-serif',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%, center center; }
          50% { background-position: 100% 50%, center center; }
          100% { background-position: 0% 50%, center center; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes drift {
          0% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-15px); }
          75% { transform: translateY(-25px) translateX(5px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        
        @keyframes pulseOrange {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        
        @keyframes pulsePurple {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        
        .fade-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .float {
          animation: float 6s ease-in-out infinite;
        }
        
        .drift {
          animation: drift 15s ease-in-out infinite;
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        .pulse-orange {
          animation: pulseOrange 2s infinite;
        }
        
        .pulse-purple {
          animation: pulsePurple 2s infinite;
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .btn-primary-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-primary-hover:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
        }
        
        .btn-secondary-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-secondary-hover:hover {
          background-color: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }
        
        .footer-link-hover {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .footer-link-hover::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
          transition: width 0.3s ease;
        }
        
        .footer-link-hover:hover::after {
          width: 100%;
        }
        
        .footer-link-hover:hover {
          color: white !important;
          transform: translateY(-1px);
        }
        
        .social-icon-hover {
          transition: all 0.3s ease;
        }
        
        .social-icon-hover:hover {
          transform: translateY(-3px) scale(1.1);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(16, 185, 129, 0.2) 100%) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
      `}</style>

      {/* Floating Background Elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)',
          borderRadius: '50%',
          animation: 'drift 8s ease-in-out infinite',
          filter: 'blur(1px)'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.04) 100%)',
          borderRadius: '50%',
          animation: 'drift 10s ease-in-out infinite reverse',
          filter: 'blur(1px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
          borderRadius: '50%',
          animation: 'drift 12s ease-in-out infinite',
          filter: 'blur(1px)'
        }}></div>
      </div>

      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        padding: '1.5rem 0',
        background: 'rgba(29, 21, 21, 0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.8s ease-out'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <img 
                  src="/logo.png" 
                  alt="PocketShop Logo" 
                  style={{
                    height: '40px',
                    width: 'auto',
                    filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))'
                  }}
                />
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>PocketShop</span>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginLeft: '0.75rem' }}>
                — business partner —
              </span>
            </div>
            <Link 
              to="/vendor/login" 
              className="btn-secondary-hover" 
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        position: 'relative',
        zIndex: 5,
        padding: '6rem 0 8rem', 
        textAlign: 'center',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 1s ease-out 0.2s'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
          <h1 className="fade-in" style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            color: 'white',
            lineHeight: '1.1',
            marginBottom: '1.5rem',
            letterSpacing: '-0.025em',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            Transform Your QR Code into a{' '}
            <span style={{
              background: 'linear-gradient(135deg, #34D399 0%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              position: 'relative',
              fontSize: '1.1em',
              fontWeight: '900'
            }}>
              Smart Storefront
            </span>
          </h1>
          
          <p className="fade-in" style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem',
            fontWeight: '400',
            animationDelay: '0.3s'
          }}>
            Join thousands of businesses using PocketShop to manage orders, 
            engage customers, and grow with AI-powered insights—all from a single QR code.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <Link 
              to="/vendor/register"
              className="btn-primary-hover" 
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animationDelay: '0.6s',
                textDecoration: 'none'
              }}
            >
              Join PocketShop
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            
            <Link 
              to="/vendor/login"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
            >
              Already have an account? Sign in
            </Link>
            
            <div className="fade-in" style={{ 
              display: 'flex', 
              gap: '3rem', 
              flexWrap: 'wrap', 
              justifyContent: 'center',
              animationDelay: '0.9s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', fontWeight: '500' }}>
                <div className="pulse" style={{ width: '16px', height: '16px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)' }}></div>
                <span>Secure & Reliable</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', fontWeight: '500' }}>
                <div className="pulse-orange" style={{ width: '16px', height: '16px', background: '#f59e0b', borderRadius: '50%', boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)' }}></div>
                <span>Setup in 5 minutes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', fontWeight: '500' }}>
                <div className="pulse-purple" style={{ width: '16px', height: '16px', background: '#8b5cf6', borderRadius: '50%', boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)' }}></div>
                <span>No app required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        position: 'relative',
        zIndex: 5,
        padding: '8rem 0', 
        background: 'rgba(15, 23, 42, 0.9)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transition: 'all 1s ease-out 0.4s'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{
            fontSize: '2.75rem',
            fontWeight: '700',
            color: 'white',
            textAlign: 'center',
            marginBottom: '5rem',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
          }}>
            Why should you partner with PocketShop?
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '3rem', 
            maxWidth: '1100px', 
            margin: '0 auto',
            alignItems: 'start'
          }}>
            {/* App-Free Experience */}
            <div className="hover-lift fade-in" style={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '3rem 2.5rem',
              textAlign: 'center',
              animationDelay: '0.6s',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                margin: '0 auto 2rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                position: 'relative'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: 'white', 
                marginBottom: '1.5rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                letterSpacing: '-0.01em'
              }}>
                App-Free Experience
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.75)', 
                lineHeight: '1.7',
                fontSize: '1rem',
                maxWidth: '280px',
                margin: '0 auto'
              }}>
                Your customers can order and pay directly through their browser. No downloads, no friction—just seamless ordering.
              </p>
            </div>

            {/* AI-Powered Analytics */}
            <div className="hover-lift fade-in" style={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '3rem 2.5rem',
              textAlign: 'center',
              animationDelay: '0.8s',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                margin: '0 auto 2rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                position: 'relative'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                </svg>
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: 'white', 
                marginBottom: '1.5rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                letterSpacing: '-0.01em'
              }}>
                AI-Powered Analytics
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.75)', 
                lineHeight: '1.7',
                fontSize: '1rem',
                maxWidth: '280px',
                margin: '0 auto'
              }}>
                Get insights into your best-selling items, peak hours, and customer preferences to make smarter business decisions.
              </p>
            </div>

            {/* Real-Time Order Management */}
            <div className="hover-lift fade-in" style={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '3rem 2.5rem',
              textAlign: 'center',
              animationDelay: '1s',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                margin: '0 auto 2rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                position: 'relative'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: 'white', 
                marginBottom: '1.5rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                letterSpacing: '-0.01em'
              }}>
                Real-Time Order Management
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.75)', 
                lineHeight: '1.7',
                fontSize: '1rem',
                maxWidth: '280px',
                margin: '0 auto'
              }}>
                Manage all your orders with our intuitive Kanban dashboard. Track orders from placement to completion effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 5,
        padding: '4rem 0 2rem',
        background: 'rgba(0, 0, 0, 0.4)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          {/* Top Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '3rem',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>PocketShop</span>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                — business partner —
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <a href="mailto:support@pocketshop.com" style={{ 
                color: '#3b82f6', 
                textDecoration: 'none', 
                fontWeight: '500',
                fontSize: '0.875rem'
              }}>
                support@pocketshop.com
              </a>
            </div>
          </div>

          {/* Main Footer Content */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {/* About PocketShop */}
            <div>
              <h4 style={{ 
                color: 'white', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                letterSpacing: '0.05em'
              }}>
                ABOUT POCKETSHOP
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    Who We Are
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    Blog
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    Work With Us
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    Investor Relations
                  </a>
                </li>
              </ul>
            </div>

            {/* For Businesses */}
            <div>
              <h4 style={{ 
                color: 'white', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                letterSpacing: '0.05em'
              }}>
                FOR BUSINESSES
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    Partner With Us
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    Business Solutions
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    API Documentation
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    Support Center
                  </a>
                </li>
              </ul>
            </div>

            {/* Learn More */}
            <div>
              <h4 style={{ 
                color: 'white', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                letterSpacing: '0.05em'
              }}>
                LEARN MORE
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    Privacy Policy
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    Terms of Service
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    Security
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" className="footer-link-hover" style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem'
                  }}>
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h4 style={{ 
                color: 'white', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                letterSpacing: '0.05em'
              }}>
                SOCIAL LINKS
              </h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {/* LinkedIn */}
                <a href="#" className="social-icon-hover" style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.7)">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a href="#" className="social-icon-hover" style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.7)">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* Twitter */}
                <a href="#" className="social-icon-hover" style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.7)">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a href="#" className="social-icon-hover" style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.7)">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a href="#" className="social-icon-hover" style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.7)">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            paddingTop: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.5)', 
              fontSize: '0.75rem', 
              lineHeight: '1.5',
              margin: 0
            }}>
              By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. 
              All trademarks are properties of their respective owners. 2025 © PocketShop™ Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main App Router
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/vendor" element={<VendorOnboarding />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/onboarding" element={<VendorOnboardingFlow />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;