/**
 * Registration Confirmation Component
 * 
 * Displays a user-friendly confirmation message after registration,
 * instructing users to check their email and confirm their account.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/constants/routes';
import logoImage from '@/assets/images/logo.png';

interface RegisterConfirmProps {
  email: string;
  onConfirmed?: () => void;
}

export const RegisterConfirm: React.FC<RegisterConfirmProps> = ({ 
  email,
  onConfirmed 
}) => {
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/vendor/onboarding/stage-1`,
        },
      });

      if (error) {
        console.error('Error resending email:', error);
        setResendError(error.message || 'Failed to resend email. Please try again.');
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (err: any) {
      console.error('Exception resending email:', err);
      setResendError('An unexpected error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleContinueToLogin = () => {
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleCheckEmail = () => {
    // Open email client (if possible)
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src={logoImage} 
            alt="PocketShop Logo" 
            className="h-16 w-16 object-contain"
          />
        </div>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
            <Mail className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Check Your Email
        </h1>

        {/* Description */}
        <div className="text-center space-y-4 mb-8">
          <p className="text-lg text-gray-600">
            We've sent a confirmation email to:
          </p>
          <p className="text-xl font-semibold text-blue-600 break-all">
            {email}
          </p>
          <p className="text-gray-600">
            Please click the confirmation link in the email to activate your account and continue with onboarding.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            Next Steps:
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Check your inbox (and spam/junk folder if needed)</li>
            <li>Click the confirmation link in the email</li>
            <li>You'll be redirected to complete your vendor profile</li>
            <li>Start setting up your storefront!</li>
          </ol>
        </div>

        {/* Resend Email Section */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <p className="text-sm text-gray-600 mb-4 text-center">
            Didn't receive the email?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendSuccess}
              className="inline-flex items-center justify-center px-6 py-3 border border-blue-300 text-base font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Email Sent!
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Resend Confirmation Email
                </>
              )}
            </button>
            <button
              onClick={handleCheckEmail}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Open Email Client
            </button>
          </div>
          {resendError && (
            <p className="text-sm text-red-600 mt-3 text-center">{resendError}</p>
          )}
          {resendSuccess && (
            <p className="text-sm text-green-600 mt-3 text-center">
              Confirmation email sent! Please check your inbox.
            </p>
          )}
        </div>

        {/* Continue to Login */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 mb-4 text-center">
            Already confirmed your email?
          </p>
          <button
            onClick={handleContinueToLogin}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Continue to Login
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Support Message */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            If you're having trouble, please contact support with your email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterConfirm;

