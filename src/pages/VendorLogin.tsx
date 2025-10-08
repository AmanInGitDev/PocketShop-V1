/**
 * Vendor Login Page
 * 
 * This page handles vendor authentication.
 * It provides a clean login form with proper validation.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Store, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  LogIn,
  AlertCircle,
  Loader2
} from 'lucide-react';
import './VendorLogin.css';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

const VendorLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        setErrors({ submit: error.message });
      } else {
        // Login successful - redirect to dashboard
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vendor-login">
      <div className="login-container">
        {/* Header */}
        <header className="login-header">
          <Link to="/vendor" className="back-link">
            <ArrowLeft className="back-icon" />
            Back to Home
          </Link>
          
          <div className="header-logo">
            <Store className="logo-icon" />
            <span className="logo-text">PocketShop</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="login-content">
          <div className="login-card">
            <div className="card-header">
              <h1 className="card-title">Welcome Back</h1>
              <p className="card-subtitle">
                Sign in to your PocketShop account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
                    value={formData.password}
                    onChange={handleInputChange}
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

              {/* Forgot Password Link */}
              <div className="forgot-password">
                <Link to="/vendor/forgot-password" className="link">
                  Forgot your password?
                </Link>
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
                disabled={isSubmitting || loading}
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

              {/* Register Link */}
              <div className="register-link">
                <p>
                  Don't have an account?{' '}
                  <Link to="/vendor/register" className="link">
                    Create one here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
