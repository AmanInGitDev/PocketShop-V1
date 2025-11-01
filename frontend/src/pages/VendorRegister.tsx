/**
 * Vendor Registration Page
 * 
 * This page handles the vendor registration process.
 * It collects business information and creates a new vendor account.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { 
  Store, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import './VendorRegister.css';

interface FormData {
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
}

interface FormErrors {
  [key: string]: string;
}

const VendorRegister: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.businessName,
            role: 'vendor',
            business_name: formData.businessName,
            mobile_number: formData.mobileNumber,
          },
        },
      });

      if (authError) {
        setErrors({ submit: authError.message });
        setIsSubmitting(false);
        return;
      }

      // Create vendor profile in users table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: formData.email,
              full_name: formData.businessName,
              role: 'vendor',
            },
          ]);

        if (profileError) {
          console.error('Error creating vendor profile:', profileError);
          setErrors({ submit: profileError.message });
          setIsSubmitting(false);
          return;
        }

        // Redirect to onboarding flow (skip email verification for now, or handle it separately)
        // After successful registration, go to onboarding
        navigate('/vendor/onboarding');
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vendor-register">
      <div className="register-container">
        {/* Header */}
        <header className="register-header">
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
        <div className="register-content">
          <div className="register-card">
            <div className="card-header">
              <h1 className="card-title">Join PocketShop</h1>
              <p className="card-subtitle">
                Create your account and start building your smart storefront
              </p>
            </div>

            {emailSent ? (
              <div className="email-verification-message">
                <CheckCircle className="success-icon" />
                <h3>Verify Your Email</h3>
                <p>
                  We've sent a verification email to <strong>{formData.email}</strong>.
                  Please check your inbox and click the verification link to complete your registration.
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  After verifying your email, you can log in to your account.
                </p>
                <Link to="/vendor/login" className="btn btn-primary mt-6">
                  Go to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                  <label htmlFor="businessName" className="form-label">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
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
                  <label htmlFor="mobileNumber" className="form-label">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
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
                        value={formData.password}
                        onChange={handleInputChange}
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
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
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
                      <CheckCircle className="btn-icon" />
                      Register
                    </>
                  )}
                </button>

                {/* Login Link */}
                <div className="login-link">
                  <p>
                    Already have an account?{' '}
                    <Link to="/vendor/login" className="link">
                      Login
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
