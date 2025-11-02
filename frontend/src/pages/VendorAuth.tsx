/**
 * Vendor Authentication Page
 * 
 * Combined login and register page for vendors with tab switching.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithGoogle, sendOTP, verifyOTP } from '@/services/supabase';
import { 
  Store, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  LogIn,
  UserPlus,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Smartphone
} from 'lucide-react';
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

const VendorAuth: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signIn, loading, user } = useAuth();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/vendor/dashboard');
    }
  }, [user, loading, navigate]);
  
  const [mode, setMode] = useState<Mode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');

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

    try {
      const { error } = await signUp(
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
      } else {
        // Redirect to onboarding after successful registration
        navigate('/vendor/onboarding');
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
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
      const { error } = await signIn(emailFormData.email, emailFormData.password);

      if (error) {
        setErrors({ submit: error.message });
      } else {
        // Redirect to dashboard after successful login
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrors({ submit: error.message });
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
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
      const { error } = await verifyOTP(phoneFormData.phone, phoneFormData.otp);
      if (error) {
        setErrors({ submit: error.message });
      } else {
        // Redirect to dashboard after successful login
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setOtpLoading(false);
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="vendor-auth">
        <div className="auth-container">
          <div className="auth-content">
            <div className="auth-card">
              <div className="card-header">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-auth">
      <div className="auth-container">
        {/* Header */}
        <header className="auth-header">
          <Link to="/" className="back-link">
            <ArrowLeft className="back-icon" />
            Back to Home
          </Link>
          
          <div className="header-logo">
            <Store className="logo-icon" />
            <span className="logo-text">PocketShop</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="auth-content">
          <div className="auth-card">
            {/* Mode Toggle */}
            <div className="mode-toggle">
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

            {/* Google OAuth Button */}
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

            <div className="divider">
              <span>or</span>
            </div>

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
      </div>
    </div>
  );
};

export default VendorAuth;

