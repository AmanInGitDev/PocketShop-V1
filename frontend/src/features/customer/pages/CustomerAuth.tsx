/**
 * Customer Auth – mobile-first sign in / sign up.
 * Used when customer taps Login on storefront or accesses profile.
 * Supports: Email+Password sign in, Sign up, Continue as Guest.
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, ChevronLeft } from 'lucide-react';
import Logo from '@/features/common/components/Logo';

type Mode = 'login' | 'register';

export default function CustomerAuth() {
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendorId');
  const redirect = searchParams.get('redirect') || ROUTES.CUSTOMER_HOME;
  const navigate = useNavigate();
  const { signIn, signUp, loading, error } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLocalError(null);
    if (mode === 'login') {
      if (!formData.email || !formData.password) {
        setLocalError('Please enter email and password');
        return;
      }
      const { error: err } = await signIn(formData.email, formData.password);
      if (!err) {
        await ensureCustomerProfile();
        navigate(redirect);
      }
    } else {
      if (!formData.email || !formData.password || !formData.name || !formData.phone) {
        setLocalError('Please fill all fields');
        return;
      }
      if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      const { error: err } = await signUp(formData.email, formData.password, {
        full_name: formData.name,
        mobile_number: formData.phone,
        role: 'customer',
      });
      if (!err) {
        await ensureCustomerProfile();
        navigate(redirect);
      }
    }
  };

  const ensureCustomerProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data: existing } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    if (existing) return;
    await supabase.from('customer_profiles').insert({
      user_id: session.user.id,
      name: session.user.user_metadata?.full_name || formData.name || 'Customer',
      mobile_number: session.user.user_metadata?.mobile_number || formData.phone || '',
      email: session.user.email || formData.email,
    });
  };

  const handleGuestContinue = () => {
    navigate(redirect);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-8">
      {/* Header - mobile optimized */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1 flex justify-center">
            <Link to={ROUTES.HOME}>
              <Logo size="md" />
            </Link>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-8 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          {mode === 'login'
            ? 'Sign in to track orders and save details'
            : 'Sign up to get started'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || localError) && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">
              {localError || error}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <Label htmlFor="name" className="text-gray-700">Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="pl-11 h-12 text-base"
                    autoComplete="name"
                    required={mode === 'register'}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-700">Phone</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    className="pl-11 h-12 text-base"
                    autoComplete="tel"
                    required={mode === 'register'}
                    maxLength={10}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="pl-11 h-12 text-base"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'login' ? 'Password' : 'Min 6 characters'}
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                className="pl-11 pr-12 h-12 text-base"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-orange-500 hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
            className="text-orange-600 font-medium text-sm"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base"
            onClick={handleGuestContinue}
          >
            Continue as Guest
          </Button>
          <p className="text-center text-gray-500 text-xs mt-3">
            You can sign in later to track orders
          </p>
        </div>
      </main>
    </div>
  );
}

