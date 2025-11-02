/**
 * Business Landing Page
 * 
 * Dedicated landing page for businesses/vendors with login and register functionality.
 * This is the page that users navigate to when clicking Business section.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, sendOTP, verifyOTP, supabase } from '../services/supabase';
import { 
  Eye, 
  EyeOff, 
  LogIn,
  UserPlus,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Smartphone,
  Store,
  ArrowLeft
} from 'lucide-react';
import Logo from '../components/Logo';
import './VendorAuth.css';

type Mode = 'register' | 'login';
type LoginMethod = 'email' | 'phone';

interface RegisterFormData {
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
}

interface EmailFormData {
  email: string;
  password: string;
}

interface PhoneFormData {
  phone: string;
  otp: string;
}

interface FormErrors {
  [key: string]: string;
}

const BusinessLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signIn, loading, user } = useAuth();
  
  // Redirect based on onboarding status if already logged in
  useEffect(() => {
    let isMounted = true;
    
    const checkAndRedirect = async () => {
      if (loading) {
        return;
      }

      if (!user) {
        return;
      }

      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (!isMounted) return;
        
        if (session?.user?.email && !session.user.email_confirmed_at) {
          console.log('Email not confirmed, staying on page');
          return;
        }
        
        const { getOnboardingRedirectPath } = await import('../utils/onboardingCheck');
        const redirectPath = await getOnboardingRedirectPath(user.id);
        
        if (!isMounted) return;
        
        if (window.location.pathname !== redirectPath) {
          console.log('Redirecting to:', redirectPath);
          navigate(redirectPath, { replace: true });
        }
      } catch (err) {
        console.error('Error checking session/onboarding:', err);
        if (isMounted && window.location.pathname !== '/vendor/onboarding/stage-1') {
          navigate('/vendor/onboarding/stage-1', { replace: true });
        }
      }
    };

    const timer = setTimeout(() => {
      checkAndRedirect();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user, loading, navigate]);
  
  const [mode, setMode] = useState<Mode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [showAuthForm, setShowAuthForm] = useState(false);

  // Register form state
  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: ''
  });

  // Login form state
  const [emailFormData, setEmailFormData] = useState<EmailFormData>({
    email: '',
    password: ''
  });
  const [phoneFormData, setPhoneFormData] = useState<PhoneFormData>({
    phone: '',
    otp: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const validateRegisterForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!registerFormData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!registerFormData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerFormData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!registerFormData.password) {
      newErrors.password = 'Password is required';
    } else if (registerFormData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!registerFormData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (registerFormData.password !== registerFormData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!registerFormData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(registerFormData.mobileNumber.replace(/\s/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmailLogin = (): boolean => {
    const newErrors: FormErrors = {};

    if (!emailFormData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailFormData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!emailFormData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePhoneLogin = (): boolean => {
    const newErrors: FormErrors = {};

    if (!phoneFormData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(phoneFormData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid mobile number';
    }

    if (otpSent && !phoneFormData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (otpSent && phoneFormData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPhoneFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { data, error } = await signUp(
        registerFormData.email,
        registerFormData.password,
        {
          full_name: registerFormData.businessName,
          mobile_number: registerFormData.mobileNumber,
          role: 'vendor'
        }
      );

      if (error) {
        setErrors({ submit: error.message });
      } else if (data?.user) {
        if (!data.user.email || !data.user.email_confirmed_at) {
          setErrors({ 
            submit: 'Please confirm your email before continuing. Check your inbox (' + registerFormData.email + ') and click the confirmation link.',
            success: true
          });
          setRegisterFormData({
            businessName: '',
            email: '',
            password: '',
            confirmPassword: '',
            mobileNumber: ''
          });
        } else {
          navigate('/vendor/onboarding/stage-1');
        }
      } else {
        setErrors({ 
          submit: 'Please confirm your email before continuing. Check your inbox (' + registerFormData.email + ') and click the confirmation link.',
          success: true
        });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmailLogin()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await signIn(emailFormData.email, emailFormData.password);

      if (error) {
        setErrors({ submit: error.message });
      } else if (data?.user) {
        const { getOnboardingRedirectPath } = await import('../utils/onboardingCheck');
        const redirectPath = await getOnboardingRedirectPath(data.user.id);
        navigate(redirectPath);
      } else {
        navigate('/vendor/onboarding/stage-1');
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrors({});
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrors({ submit: error.message });
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'An unexpected error occurred. Please try again.' });
      setGoogleLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!validatePhoneLogin()) {
      return;
    }

    setOtpLoading(true);
    try {
      const { error } = await sendOTP(phoneFormData.phone);
      if (error) {
        setErrors({ submit: error.message });
      } else {
        setOtpSent(true);
        setErrors({});
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneLogin()) {
      return;
    }

    setOtpLoading(true);
    try {
      const { data, error } = await verifyOTP(phoneFormData.phone, phoneFormData.otp);
      if (error) {
        setErrors({ submit: error.message });
      } else if (data?.user) {
        const { getOnboardingRedirectPath } = await import('../utils/onboardingCheck');
        const redirectPath = await getOnboardingRedirectPath(data.user.id);
        navigate(redirectPath);
      } else {
        navigate('/vendor/onboarding/stage-1');
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGetStarted = () => {
    setShowAuthForm(true);
    setMode('register');
    // Scroll to auth form
    setTimeout(() => {
      document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSignInClick = () => {
    setShowAuthForm(true);
    setMode('login');
    setTimeout(() => {
      document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/">
              <Logo size="md" />
            </Link>
            <div className="flex gap-3">
              <button
                onClick={handleSignInClick}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg font-medium transition-colors border border-white/30"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Empower Your{' '}
              <span className="text-pink-500">Business</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Join thousands of businesses using PocketShop to reach more
              customers, track sales, and grow with data-driven insights.
            </p>
          </div>

          {/* Before/After Comparison */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-red-400 mb-6">Before</h3>
                <div className="bg-red-500/20 rounded-lg p-6 border border-red-500/30">
                  <ul className="space-y-3 text-white/70 text-left">
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      Limited customer reach
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      Manual order management
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      No sales analytics
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      Difficult customer discovery
                    </li>
                  </ul>
                </div>
              </div>

              {/* After */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-400 mb-6">After</h3>
                <div className="bg-green-500/20 rounded-lg p-6 border border-green-500/30">
                  <ul className="space-y-3 text-white/70 text-left">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      Expanded customer base
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      Automated order system
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      Real-time analytics dashboard
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      Easy customer discovery
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Feature 1 - Orders */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Order Management</h3>
              <p className="text-white/70 text-sm">
                Manage all your orders in one place with real-time updates
                and notifications.
              </p>
            </div>

            {/* Feature 2 - Analytics */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
              <p className="text-white/70 text-sm">
                Get insights into your sales, customer behavior, and business
                performance.
              </p>
            </div>

            {/* Feature 3 - Menu */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Menu Management</h3>
              <p className="text-white/70 text-sm">
                Easily create and update your menu with photos, descriptions,
                and pricing.
              </p>
            </div>

            {/* Feature 4 - Payments */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 bg-yellow-500/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-yellow-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Payments</h3>
              <p className="text-white/70 text-sm">
                Secure payment processing with multiple payment options for
                your customers.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl p-12 border border-pink-500/30 mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Get Started for Free
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              No credit card required. Start growing your business today.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
              >
                Sign Up Now
              </button>
              <button
                onClick={handleSignInClick}
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors border border-white/30"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Section */}
      {showAuthForm && (
        <section id="auth-section" className="py-16 bg-white/5 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {/* Mode Toggle */}
              <div className="mode-toggle mb-6">
                <button
                  type="button"
                  className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('login');
                    setErrors({});
                    setOtpSent(false);
                  }}
                >
                  <LogIn className="mode-icon" />
                  Login
                </button>
                <button
                  type="button"
                  className={`mode-btn ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('register');
                    setErrors({});
                    setOtpSent(false);
                  }}
                >
                  <UserPlus className="mode-icon" />
                  Register
                </button>
              </div>

              <div className="card-header">
                <h1 className="card-title">
                  {mode === 'register' ? 'Join PocketShop' : 'Welcome Back'}
                </h1>
                <p className="card-subtitle">
                  {mode === 'register' 
                    ? 'Create your account and start building your smart storefront'
                    : 'Sign in to your PocketShop account'}
                </p>
              </div>

              {/* Google OAuth Button - Only show on Login */}
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || isSubmitting || otpLoading}
                  className="btn btn-google"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="btn-icon spinning" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </button>
              )}

              {/* Divider - Only show on Login */}
              {mode === 'login' && (
                <div className="divider">
                  <span>or</span>
                </div>
              )}

              {/* Register Form */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="businessName" className="form-label">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={registerFormData.businessName}
                      onChange={handleRegisterInputChange}
                      className={`form-input ${errors.businessName ? 'error' : ''}`}
                      placeholder="Enter your business name"
                    />
                    {errors.businessName && (
                      <div className="form-error">
                        <AlertCircle className="error-icon" />
                        {errors.businessName}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={registerFormData.email}
                      onChange={handleRegisterInputChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Enter your email address"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <div className="form-error">
                        <AlertCircle className="error-icon" />
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobileNumber" className="form-label">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={registerFormData.mobileNumber}
                      onChange={handleRegisterInputChange}
                      className={`form-input ${errors.mobileNumber ? 'error' : ''}`}
                      placeholder="Enter your mobile number"
                      autoComplete="tel"
                    />
                    {errors.mobileNumber && (
                      <div className="form-error">
                        <AlertCircle className="error-icon" />
                        {errors.mobileNumber}
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="password" className="form-label">
                        Password *
                      </label>
                      <div className="password-input">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={registerFormData.password}
                          onChange={handleRegisterInputChange}
                          className={`form-input ${errors.password ? 'error' : ''}`}
                          placeholder="Create a password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      {errors.password && (
                        <div className="form-error">
                          <AlertCircle className="error-icon" />
                          {errors.password}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password *
                      </label>
                      <div className="password-input">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={registerFormData.confirmPassword}
                          onChange={handleRegisterInputChange}
                          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <div className="form-error">
                          <AlertCircle className="error-icon" />
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Error/Success */}
                  {errors.submit && (
                    <div className={errors.success ? "submit-success" : "submit-error"}>
                      {!errors.success && <AlertCircle className="error-icon" />}
                      {errors.submit}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="btn-icon spinning" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="btn-icon" />
                        Register
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Login Forms */}
              {mode === 'login' && (
                <>
                  {/* Login Method Toggle */}
                  <div className="login-method-toggle">
                    <button
                      type="button"
                      className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
                      onClick={() => {
                        setLoginMethod('email');
                        setOtpSent(false);
                        setErrors({});
                      }}
                    >
                      <Mail className="method-icon" />
                      Email
                    </button>
                    <button
                      type="button"
                      className={`method-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                      onClick={() => {
                        setLoginMethod('phone');
                        setOtpSent(false);
                        setErrors({});
                      }}
                    >
                      <Phone className="method-icon" />
                      Phone OTP
                    </button>
                  </div>

                  {/* Email/Password Form */}
                  {loginMethod === 'email' && (
                    <form onSubmit={handleEmailLoginSubmit} className="auth-form">
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={emailFormData.email}
                          onChange={handleEmailInputChange}
                          className={`form-input ${errors.email ? 'error' : ''}`}
                          placeholder="Enter your email address"
                          autoComplete="email"
                        />
                        {errors.email && (
                          <div className="form-error">
                            <AlertCircle className="error-icon" />
                            {errors.email}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="password" className="form-label">
                          Password
                        </label>
                        <div className="password-input">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={emailFormData.password}
                            onChange={handleEmailInputChange}
                            className={`form-input ${errors.password ? 'error' : ''}`}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </button>
                        </div>
                        {errors.password && (
                          <div className="form-error">
                            <AlertCircle className="error-icon" />
                            {errors.password}
                          </div>
                        )}
                      </div>

                      {/* Submit Error */}
                      {errors.submit && (
                        <div className="submit-error">
                          <AlertCircle className="error-icon" />
                          {errors.submit}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg submit-btn"
                        disabled={isSubmitting || loading || googleLoading || otpLoading}
                      >
                        {isSubmitting || loading ? (
                          <>
                            <Loader2 className="btn-icon spinning" />
                            Signing In...
                          </>
                        ) : (
                          <>
                            <LogIn className="btn-icon" />
                            Sign In
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Phone OTP Form */}
                  {loginMethod === 'phone' && (
                    <form onSubmit={otpSent ? handleVerifyOTP : undefined} className="auth-form">
                      <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={phoneFormData.phone}
                          onChange={handlePhoneInputChange}
                          className={`form-input ${errors.phone ? 'error' : ''}`}
                          placeholder="Enter your mobile number"
                          autoComplete="tel"
                          disabled={otpSent}
                        />
                        {errors.phone && (
                          <div className="form-error">
                            <AlertCircle className="error-icon" />
                            {errors.phone}
                          </div>
                        )}
                      </div>

                      {otpSent && (
                        <div className="form-group">
                          <label htmlFor="otp" className="form-label">
                            Enter OTP
                          </label>
                          <input
                            type="text"
                            id="otp"
                            name="otp"
                            value={phoneFormData.otp}
                            onChange={handlePhoneInputChange}
                            className={`form-input ${errors.otp ? 'error' : ''}`}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            pattern="[0-9]{6}"
                          />
                          {errors.otp && (
                            <div className="form-error">
                              <AlertCircle className="error-icon" />
                              {errors.otp}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setPhoneFormData(prev => ({ ...prev, otp: '' }));
                            }}
                            className="link text-sm mt-2"
                          >
                            Change number
                          </button>
                        </div>
                      )}

                      {/* Submit Error */}
                      {errors.submit && (
                        <div className="submit-error">
                          <AlertCircle className="error-icon" />
                          {errors.submit}
                        </div>
                      )}

                      {/* Submit/Verify Button */}
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          className="btn btn-primary btn-lg submit-btn"
                          disabled={otpLoading || isSubmitting || googleLoading || loading}
                        >
                          {otpLoading ? (
                            <>
                              <Loader2 className="btn-icon spinning" />
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              <Smartphone className="btn-icon" />
                              Send OTP
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg submit-btn"
                          disabled={otpLoading || isSubmitting || googleLoading || loading}
                        >
                          {otpLoading ? (
                            <>
                              <Loader2 className="btn-icon spinning" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <LogIn className="btn-icon" />
                              Verify OTP
                            </>
                          )}
                        </button>
                      )}
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-white/60 text-sm">
            <p>© 2025 PocketShop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BusinessLandingPage;

