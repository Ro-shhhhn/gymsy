import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LocationState {
  email: string;
  name?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 minutes instead of 10
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isResending, setIsResending] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isOtpComplete, setIsOtpComplete] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateOtpInput = (value: string): boolean => {
    return /^\d$/.test(value); // Only single digit
  };

  const validateCompleteOtp = (otpArray: string[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const otpString = otpArray.join('');
    
    if (otpString.length === 0) {
      errors.push({ field: 'otp', message: 'Please enter the verification code' });
    } else if (otpString.length < 6) {
      errors.push({ field: 'otp', message: 'Please enter all 6 digits' });
    } else if (!/^\d{6}$/.test(otpString)) {
      errors.push({ field: 'otp', message: 'Verification code must contain only numbers' });
    }
    
    return errors;
  };

  // Clear messages after timeout
  const clearMessages = () => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  };

  // Redirect if no email in state
  useEffect(() => {
    if (!state?.email || !validateEmail(state.email)) {
      navigate('/register');
    }
  }, [state?.email, navigate]);

  // Check if OTP is complete
  useEffect(() => {
    const otpString = otp.join('');
    setIsOtpComplete(otpString.length === 6 && /^\d{6}$/.test(otpString));
  }, [otp]);

  // Timer effect for OTP expiry
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(timeLeft <= 0);
    }
  }, [resendCooldown, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    // Clear previous errors
    setValidationErrors([]);
    setError('');
    
    // Validate input
    if (value && !validateOtpInput(value)) {
      setValidationErrors([{ field: 'otp', message: 'Only numbers are allowed' }]);
      return;
    }
    
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear errors on any key press
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }

    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Handle Enter key
    if (e.key === 'Enter' && isOtpComplete) {
      handleSubmit(e as any);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 0) {
      setValidationErrors([{ field: 'otp', message: 'Invalid paste data. Please paste a 6-digit code.' }]);
      return;
    }

    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    
    setOtp(newOtp);
    setValidationErrors([]);
    setError('');
    
    // Focus on the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OTP
    const errors = validateCompleteOtp(otp);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Check if time expired
    if (timeLeft <= 0) {
      setError('Verification code has expired. Please request a new one.');
      return;
    }

    const otpString = otp.join('');
    setIsLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors([]);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: state.email,
          otp: otpString
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Email verified successfully! Redirecting...');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect after showing success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setValidationErrors(data.errors.map((err: any) => ({
            field: err.path || err.param || 'general',
            message: err.msg || err.message
          })));
        } else {
          setError(data.message || 'Invalid verification code. Please try again.');
        }
        
        // Clear OTP on error for security
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Network error occurred. Please check your connection and try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
      clearMessages();
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || resendCooldown > 0) return;

    setIsResending(true);
    setError('');
    setSuccess('');
    setValidationErrors([]);

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: state.email
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTimeLeft(180); // Reset timer to 3 minutes
        setCanResend(false);
        setResendCooldown(60); // 1 minute cooldown
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setSuccess('New verification code sent to your email!');
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setValidationErrors(data.errors.map((err: any) => ({
            field: err.path || err.param || 'general',
            message: err.msg || err.message
          })));
        } else {
          setError(data.message || 'Failed to resend verification code. Please try again.');
        }
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
      console.error('Resend OTP error:', error);
    } finally {
      setIsResending(false);
      clearMessages();
    }
  };

  if (!state?.email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-white to-cyan-50">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-cyan-300/30 to-blue-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-cyan-200/40 to-teal-200/40 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 text-sm">
              We've sent a 6-digit code to
            </p>
            <p className="text-gray-800 font-semibold break-all">
              {state.email}
            </p>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
              timeLeft > 120 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : timeLeft > 60 
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                : timeLeft > 0
                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Code expired'}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 backdrop-blur-sm bg-green-50/90 border-2 border-green-300/80 rounded-2xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 backdrop-blur-sm bg-red-50/90 border-2 border-red-300/80 rounded-2xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6 backdrop-blur-sm bg-red-50/90 border-2 border-red-300/80 rounded-2xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  {validationErrors.map((error, index) => (
                    <p key={index} className="font-medium text-sm text-red-700">
                      {error.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 text-center text-xl font-bold bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-800 ${
                      validationErrors.some(err => err.field === 'otp')
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200/50 bg-red-50/80'
                        : digit
                        ? 'border-cyan-400 bg-cyan-50/80 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/50'
                        : 'border-gray-300 hover:border-cyan-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/50'
                    }`}
                    disabled={isLoading || timeLeft <= 0}
                    autoComplete="off"
                    aria-label={`Digit ${index + 1} of verification code`}
                  />
                ))}
              </div>
              {/* Input instruction */}
              <p className="text-xs text-gray-500 text-center mt-2">
                Enter the 6-digit code or paste it from your clipboard
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isOtpComplete || timeLeft <= 0}
              className="w-full py-4 px-6 text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:from-gray-400 disabled:to-gray-500"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : timeLeft <= 0 ? (
                'Code Expired'
              ) : !isOtpComplete ? (
                'Enter Complete Code'
              ) : (
                'Verify Email'
              )}
            </button>

            {/* Resend Button */}
            <div className="text-center space-y-3">
              <p className="text-gray-600 text-sm">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || resendCooldown > 0 || isResending}
                className="text-cyan-600 hover:text-cyan-700 font-semibold text-sm disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-300 hover:underline"
              >
                {isResending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : canResend ? (
                  'Resend Code'
                ) : (
                  'Resend Code'
                )}
              </button>
            </div>

            {/* Back to Register */}
            <div className="text-center pt-4 border-t border-gray-200/50">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium transition-colors duration-300 hover:underline"
              >
                ← Back to Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;