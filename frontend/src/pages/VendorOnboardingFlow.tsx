/**
 * Vendor Onboarding Flow
 * 
 * Multi-step onboarding process after registration/login.
 * Steps: Resto Info → Operational Details → Plans → Terms & Conditions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import './VendorOnboardingFlow.css';
import { 
  Store, 
  MapPin, 
  Clock, 
  Calendar,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import './VendorOnboardingFlow.css';

type OnboardingStep = 'resto-info' | 'operational-details' | 'plans' | 'terms';

interface RestoInfoData {
  restaurantName: string;
  ownerName: string;
  location: {
    lat: number | null;
    lng: number | null;
    address: string;
  };
  address: string;
}

interface OperationalDetailsData {
  menuImage: File | null;
  restaurantDP: File | null;
  timings: {
    open: string;
    close: string;
  };
  workingDays: string[];
  bankAccount: string;
  upiId: string;
  customTimings: boolean;
}

interface PlanData {
  selectedPlan: 'gold' | 'platinum' | null;
}

const VendorOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('resto-info');
  
  const [restoInfo, setRestoInfo] = useState<RestoInfoData>({
    restaurantName: '',
    ownerName: '',
    location: {
      lat: null,
      lng: null,
      address: ''
    },
    address: ''
  });

  const [operationalDetails, setOperationalDetails] = useState<OperationalDetailsData>({
    menuImage: null,
    restaurantDP: null,
    timings: {
      open: '09:00',
      close: '22:00'
    },
    workingDays: [],
    bankAccount: '',
    upiId: '',
    customTimings: false
  });

  const [planData, setPlanData] = useState<PlanData>({
    selectedPlan: 'gold'
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/vendor/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="onboarding-flow">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const steps = [
    { id: 'resto-info', label: 'Resto Info', icon: Store },
    { id: 'operational-details', label: 'Operational Details', icon: Clock },
    { id: 'plans', label: 'Plans', icon: CreditCard }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === currentStep);
  };

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as OnboardingStep);
    } else {
      setCurrentStep('terms');
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as OnboardingStep);
    }
  };

  const handleComplete = async () => {
    // Save all onboarding data and redirect to dashboard
    // TODO: Save to Supabase
    navigate('/vendor/dashboard');
  };

  return (
    <div className="onboarding-flow">
      <div className="onboarding-container">
        {/* Sidebar */}
        <aside className="onboarding-sidebar">
          <div className="sidebar-header">
            <Store className="sidebar-logo" />
            <h2>PocketShop</h2>
          </div>
          
          <nav className="sidebar-steps">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = getCurrentStepIndex() > index;
              
              return (
                <div
                  key={step.id}
                  className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="step-icon-wrapper">
                    {isCompleted ? (
                      <CheckCircle className="step-icon" />
                    ) : (
                      <StepIcon className="step-icon" />
                    )}
                  </div>
                  <div className="step-content">
                    <span className="step-number">Step {index + 1}</span>
                    <span className="step-label">{step.label}</span>
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="onboarding-content">
          {currentStep === 'resto-info' && (
            <RestoInfoStep
              data={restoInfo}
              onChange={setRestoInfo}
              onNext={handleNext}
            />
          )}

          {currentStep === 'operational-details' && (
            <OperationalDetailsStep
              data={operationalDetails}
              onChange={setOperationalDetails}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 'plans' && (
            <PlansStep
              data={planData}
              onChange={setPlanData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 'terms' && (
            <TermsStep
              accepted={acceptedTerms}
              onAcceptChange={setAcceptedTerms}
              onComplete={handleComplete}
              onPrevious={handlePrevious}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Step 1: Resto Info Component
const RestoInfoStep: React.FC<{
  data: RestoInfoData;
  onChange: (data: RestoInfoData) => void;
  onNext: () => void;
}> = ({ data, onChange, onNext }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!data.restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant name is required';
    }
    if (!data.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    if (!data.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h1>Restaurant Information</h1>
        <p>Tell us about your restaurant</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="form-group">
          <label htmlFor="restaurantName">Restaurant Name *</label>
          <input
            type="text"
            id="restaurantName"
            value={data.restaurantName}
            onChange={(e) => onChange({ ...data, restaurantName: e.target.value })}
            placeholder="Enter your restaurant name"
            className={errors.restaurantName ? 'error' : ''}
          />
          {errors.restaurantName && (
            <span className="error-message">{errors.restaurantName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="ownerName">Owner Name *</label>
          <input
            type="text"
            id="ownerName"
            value={data.ownerName}
            onChange={(e) => onChange({ ...data, ownerName: e.target.value })}
            placeholder="Enter owner name"
            className={errors.ownerName ? 'error' : ''}
          />
          {errors.ownerName && (
            <span className="error-message">{errors.ownerName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <div className="location-input">
            <MapPin className="location-icon" />
            <input
              type="text"
              id="location"
              value={data.location.address}
              onChange={(e) => onChange({
                ...data,
                location: { ...data.location, address: e.target.value }
              })}
              placeholder="Search for location"
            />
          </div>
          <div className="map-placeholder">
            <MapPin className="map-icon" />
            <p>Map will be displayed here</p>
            <small>Click to set location on map</small>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">Address *</label>
          <textarea
            id="address"
            value={data.address}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
            placeholder="Enter complete address"
            rows={4}
            className={errors.address ? 'error' : ''}
          />
          {errors.address && (
            <span className="error-message">{errors.address}</span>
          )}
        </div>

        <div className="step-actions">
          <button type="submit" className="btn btn-primary">
            Next: Operational Details
            <ArrowRight className="btn-icon" />
          </button>
        </div>
      </form>
    </div>
  );
};

// Step 2: Operational Details Component
const OperationalDetailsStep: React.FC<{
  data: OperationalDetailsData;
  onChange: (data: OperationalDetailsData) => void;
  onNext: () => void;
  onPrevious: () => void;
}> = ({ data, onChange, onNext, onPrevious }) => {
  const handleFileChange = (field: 'menuImage' | 'restaurantDP', file: File | null) => {
    onChange({ ...data, [field]: file });
  };

  const handleDayToggle = (day: string) => {
    const newDays = data.workingDays.includes(day)
      ? data.workingDays.filter(d => d !== day)
      : [...data.workingDays, day];
    onChange({ ...data, workingDays: newDays });
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h1>Operational Details</h1>
        <p>Set up your restaurant operations</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="step-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="menuImage">Menu Image Upload</label>
            <div className="file-upload">
              <input
                type="file"
                id="menuImage"
                accept="image/*"
                onChange={(e) => handleFileChange('menuImage', e.target.files?.[0] || null)}
                className="file-input"
              />
              <label htmlFor="menuImage" className="file-label">
                <Upload className="upload-icon" />
                {data.menuImage ? data.menuImage.name : 'Upload Menu Image'}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="restaurantDP">Restaurant Display Picture</label>
            <div className="file-upload">
              <input
                type="file"
                id="restaurantDP"
                accept="image/*"
                onChange={(e) => handleFileChange('restaurantDP', e.target.files?.[0] || null)}
                className="file-input"
              />
              <label htmlFor="restaurantDP" className="file-label">
                <ImageIcon className="upload-icon" />
                {data.restaurantDP ? data.restaurantDP.name : 'Upload Restaurant DP'}
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Restaurant Timings</label>
          <div className="timing-inputs">
            <input
              type="time"
              value={data.timings.open}
              onChange={(e) => onChange({
                ...data,
                timings: { ...data.timings, open: e.target.value }
              })}
            />
            <span>to</span>
            <input
              type="time"
              value={data.timings.close}
              onChange={(e) => onChange({
                ...data,
                timings: { ...data.timings, close: e.target.value }
              })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Working Days *</label>
          <div className="days-grid">
            {days.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`day-button ${data.workingDays.includes(day) ? 'active' : ''}`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={data.customTimings}
              onChange={(e) => onChange({ ...data, customTimings: e.target.checked })}
            />
            Customized Timing and Slot
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bankAccount">Bank Account Number</label>
            <input
              type="text"
              id="bankAccount"
              value={data.bankAccount}
              onChange={(e) => onChange({ ...data, bankAccount: e.target.value })}
              placeholder="Enter bank account number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="upiId">UPI ID</label>
            <input
              type="text"
              id="upiId"
              value={data.upiId}
              onChange={(e) => onChange({ ...data, upiId: e.target.value })}
              placeholder="Enter UPI ID"
            />
          </div>
        </div>

        <div className="step-actions">
          <button type="button" onClick={onPrevious} className="btn btn-secondary">
            <ArrowLeft className="btn-icon" />
            Previous
          </button>
          <button type="submit" className="btn btn-primary">
            Next: Plans
            <ArrowRight className="btn-icon" />
          </button>
        </div>
      </form>
    </div>
  );
};

// Step 3: Plans Component
const PlansStep: React.FC<{
  data: PlanData;
  onChange: (data: PlanData) => void;
  onNext: () => void;
  onPrevious: () => void;
}> = ({ data, onChange, onNext, onPrevious }) => {
  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h1>Choose Your Plan</h1>
        <p>Select the plan that works best for you</p>
      </div>

      <div className="plans-grid">
        <div
          className={`plan-card ${data.selectedPlan === 'gold' ? 'selected' : ''}`}
          onClick={() => onChange({ selectedPlan: 'gold' })}
        >
          <div className="plan-header">
            <h3>Free Plans - Gold</h3>
            <div className="plan-badge">Current</div>
          </div>
          <ul className="plan-features">
            <li>✓ Zero setup cost</li>
            <li>✓ Unlimited orders & extent</li>
            <li>✓ Custom Virtual Dashboard</li>
            <li>✓ Real-time order tracking</li>
            <li>✓ Live Payment Support</li>
          </ul>
          <div className="plan-footer">
            <span className="plan-price">Free</span>
          </div>
        </div>

        <div className="plan-card coming-soon">
          <div className="plan-header">
            <h3>Version 2 - Platinum</h3>
            <div className="plan-badge">Coming Soon</div>
          </div>
          <ul className="plan-features">
            <li>All Gold features, plus:</li>
            <li>• Advanced analytics</li>
            <li>• Priority support</li>
            <li>• Custom branding</li>
            <li>• API access</li>
          </ul>
          <div className="plan-footer">
            <span className="plan-price">Coming Soon</span>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" onClick={onPrevious} className="btn btn-secondary">
          <ArrowLeft className="btn-icon" />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary"
          disabled={!data.selectedPlan}
        >
          Next: Terms & Conditions
          <ArrowRight className="btn-icon" />
        </button>
      </div>
    </div>
  );
};

// Step 4: Terms and Conditions Component
const TermsStep: React.FC<{
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
  onComplete: () => void;
  onPrevious: () => void;
}> = ({ accepted, onAcceptChange, onComplete, onPrevious }) => {
  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h1>Terms and Conditions</h1>
        <p>Please read and accept our terms</p>
      </div>

      <div className="terms-content">
        <div className="terms-text">
          <h3>Terms of Service</h3>
          <p>
            By using PocketShop, you agree to comply with and be bound by the following terms and conditions.
            Please review these terms carefully.
          </p>
          
          <h4>1. Service Description</h4>
          <p>
            PocketShop provides a platform for businesses to create virtual storefronts and manage orders
            through QR codes. We offer various features including order management, payment processing,
            and analytics.
          </p>

          <h4>2. User Responsibilities</h4>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree
            to accept responsibility for all activities that occur under your account.
          </p>

          <h4>3. Payment Terms</h4>
          <p>
            Payment processing is handled through secure third-party providers. PocketShop is not responsible
            for payment disputes between vendors and customers.
          </p>

          <h4>4. Intellectual Property</h4>
          <p>
            All content included on this platform, such as text, graphics, logos, and software, is the
            property of PocketShop or its content suppliers.
          </p>

          <h4>5. Limitation of Liability</h4>
          <p>
            PocketShop shall not be liable for any indirect, incidental, special, consequential, or punitive
            damages resulting from your use of the service.
          </p>
        </div>

        <div className="terms-acceptance">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => onAcceptChange(e.target.checked)}
            />
            <span>I have read and agree to the Terms and Conditions</span>
          </label>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" onClick={onPrevious} className="btn btn-secondary">
          <ArrowLeft className="btn-icon" />
          Previous
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="btn btn-primary"
          disabled={!accepted}
        >
          <CheckCircle className="btn-icon" />
          Accept & Complete Setup
        </button>
      </div>
    </div>
  );
};

export default VendorOnboardingFlow;

