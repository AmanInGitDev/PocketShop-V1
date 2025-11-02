import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP } from '../../../../services/supabase';
import { InputField } from '../../../../components/shared/InputField';
import { Button } from '../../../../components/shared/Button';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await sendOTP(mobileNumber);

      if (error) throw error;
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await verifyOTP(mobileNumber, otp);

      if (error) throw error;

      // Redirect to onboarding stage 1
      navigate('/vendor/onboarding/stage-1');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1C1C1C]">PocketShop</h1>
          <p className="text-[#7E8C97] mt-2">For Vendors</p>
        </div>

        {/* Register Form */}
        <form onSubmit={step === 'mobile' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
          {step === 'mobile' ? (
            <>
              <div>
                <h2 className="text-2xl font-bold text-[#1C1C1C] mb-2">Register Your Business</h2>
                <p className="text-[#7E8C97]">Enter your mobile number to get started</p>
              </div>
              <InputField
                type="tel"
                label="Mobile Number"
                placeholder="+91 XXXXX XXXXX"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
            </>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold text-[#1C1C1C] mb-2">Verify OTP</h2>
                <p className="text-[#7E8C97]">Enter the OTP sent to {mobileNumber}</p>
              </div>
              <InputField
                type="text"
                label="OTP Code"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                maxLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setStep('mobile')}
                className="text-[#EF4F5F] font-medium text-sm hover:underline"
              >
                Change mobile number?
              </button>
            </>
          )}

          {error && (
            <div className="bg-[#E8352F] bg-opacity-10 border border-[#E83935] rounded-lg p-3">
              <p className="text-[#E83935] text-sm font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            {step === 'mobile' ? 'Send OTP' : 'Verify & Continue'}
          </Button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-[#7E8C97] text-sm mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#EF4F5F] font-medium hover:underline"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

