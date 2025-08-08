// src/utils/validation.ts

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  if (email.length > 100) {
    errors.push('Email is too long (maximum 100 characters)');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Check for common email typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain) {
    const suggestions = commonDomains.filter(d => 
      d !== domain && 
      (d.includes(domain.substring(0, 3)) || domain.includes(d.substring(0, 3)))
    );
    if (suggestions.length > 0 && !commonDomains.includes(domain)) {
      errors.push(`Did you mean ${suggestions[0]}?`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password is too long (maximum 128 characters)');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty123', 'abc123456', 
    'password123', '123456789', 'welcome123'
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name || !name.trim()) {
    errors.push('Name is required');
    return { isValid: false, errors };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (trimmedName.length > 50) {
    errors.push('Name is too long (maximum 50 characters)');
  }
  
  if (!/^[a-zA-Z\s]*$/.test(trimmedName)) {
    errors.push('Name can only contain letters and spaces');
  }
  
  if (/^\s|\s$/.test(name)) {
    errors.push('Name cannot start or end with spaces');
  }
  
  if (/\s{2,}/.test(trimmedName)) {
    errors.push('Name cannot contain multiple consecutive spaces');
  }
  
  return { isValid: errors.length === 0, errors };
};

// OTP validation
export const validateOTP = (otp: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!otp) {
    errors.push('Verification code is required');
    return { isValid: false, errors };
  }
  
  if (otp.length !== 6) {
    errors.push('Verification code must be exactly 6 digits');
  }
  
  if (!/^\d{6}$/.test(otp)) {
    errors.push('Verification code must contain only numbers');
  }
  
  return { isValid: errors.length === 0, errors };
};

// OTP array validation (for individual inputs)
export const validateOTPArray = (otpArray: string[]): ValidationResult => {
  const errors: string[] = [];
  
  if (otpArray.length !== 6) {
    errors.push('Please enter all 6 digits');
    return { isValid: false, errors };
  }
  
  const otp = otpArray.join('');
  return validateOTP(otp);
};

// Form validation for registration
export const validateRegistrationForm = (formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  
  // Validate name
  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.errors;
  }
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.errors;
  }
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors;
  }
  
  // Validate confirm password if provided
  if (formData.confirmPassword !== undefined) {
    if (!formData.confirmPassword) {
      errors.confirmPassword = ['Please confirm your password'];
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = ['Passwords do not match'];
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Form validation for login
export const validateLoginForm = (formData: {
  email: string;
  password: string;
}): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.errors;
  }
  
  // Basic password validation for login (less strict)
  if (!formData.password) {
    errors.password = ['Password is required'];
  } else if (formData.password.length > 128) {
    errors.password = ['Password is too long'];
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time validation helpers
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  color: string;
} => {
  let score = 0;
  const feedback: string[] = [];
  
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push('Add special characters');
  
  if (password.length >= 12) score += 1;
  
  let color = 'red';
  if (score >= 4) color = 'yellow';
  if (score >= 5) color = 'green';
  
  return { score, feedback, color };
};

// Sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

export const sanitizeName = (name: string): string => {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z\s]/g, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

// Input formatting helpers
export const formatOTPInput = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 1);
};

export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};

// Error message helpers
export const getFieldError = (errors: Record<string, string[]>, field: string): string | null => {
  return errors[field] && errors[field].length > 0 ? errors[field][0] : null;
};

export const hasFieldError = (errors: Record<string, string[]>, field: string): boolean => {
  return errors[field] && errors[field].length > 0;
};

// Debounce helper for real-time validation
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Custom validation rules
export const createCustomValidator = (
  validationFn: (value: any) => boolean,
  errorMessage: string
) => {
  return (value: any): ValidationResult => {
    const isValid = validationFn(value);
    return {
      isValid,
      errors: isValid ? [] : [errorMessage]
    };
  };
};

// Async validation helper
export const createAsyncValidator = <T>(
  validationFn: (value: T) => Promise<boolean>,
  errorMessage: string
) => {
  return async (value: T): Promise<ValidationResult> => {
    try {
      const isValid = await validationFn(value);
      return {
        isValid,
        errors: isValid ? [] : [errorMessage]
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Validation error occurred']
      };
    }
  };
};