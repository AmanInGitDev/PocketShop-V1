/**
 * Vendor Registration Page
 * 
 * This page handles the vendor registration process.
 * It collects business information and creates a new vendor account.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  businessCategory: string;
  phone: string;
  address: string;
}

interface FormErrors {
  [key: string]: string;
}

const VendorRegister: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessCategory: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessCategories = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe', label: 'Café' },
    { value: 'retail', label: 'Retail Store' },
    { value: 'salon', label: 'Salon & Spa' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'grocery', label: 'Grocery Store' },
    { value: 'other', label: 'Other' }
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
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

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.businessCategory) {
      newErrors.businessCategory = 'Please select a business category';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Business address is required';
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
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.fullName,
          role: 'vendor'
        }
      );

      if (error) {
        setErrors({ submit: error.message });
      } else {
        // Registration successful - redirect to dashboard or next step
        navigate('/vendor/dashboard');
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

            <form onSubmit={handleSubmit} className="register-form">
              {/* Personal Information */}
              <div className="form-section">
                <h3 className="section-title">Personal Information</h3>
                
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.fullName}
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
                  />
                  {errors.email && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.email}
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
              </div>

              {/* Business Information */}
              <div className="form-section">
                <h3 className="section-title">Business Information</h3>
                
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
                  <label htmlFor="businessCategory" className="form-label">
                    Business Category *
                  </label>
                  <select
                    id="businessCategory"
                    name="businessCategory"
                    value={formData.businessCategory}
                    onChange={handleInputChange}
                    className={`form-input ${errors.businessCategory ? 'error' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {businessCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.businessCategory && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.businessCategory}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.phone}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    Business Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`form-input ${errors.address ? 'error' : ''}`}
                    placeholder="Enter your business address"
                    rows={3}
                  />
                  {errors.address && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.address}
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
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="btn-icon spinning" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="btn-icon" />
                    Create Account
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="login-link">
                <p>
                  Already have an account?{' '}
                  <Link to="/vendor/login" className="link">
                    Sign in here
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

export default VendorRegister;
