import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { body, validationResult } from 'express-validator';
import { emailService } from '../services/emailService';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting middleware
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 OTP requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const verificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 verification attempts per windowMs
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email is too long'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const otpValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

const emailValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password is too long')
];

// Utility functions
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

const canSendOTP = (lastOtpSent: Date | undefined): boolean => {
  if (!lastOtpSent) return true;
  const now = new Date();
  const timeDiff = now.getTime() - lastOtpSent.getTime();
  return timeDiff >= 60000; // 1 minute cooldown
};

const isOTPExpired = (otpExpires: Date | undefined): boolean => {
  if (!otpExpires) return true;
  return otpExpires < new Date();
};

// TypeScript-safe validation error formatter
const formatValidationErrors = (errors: any[]): any[] => {
  return errors.map((error: any) => ({
    field: error.path || error.param || 'general',
    message: error.msg || 'Validation error',
    value: error.value || null
  }));
};

// Enhanced error response helper
const sendErrorResponse = (res: Response, statusCode: number, message: string, errors?: any[], field?: string) => {
  const response: any = {
    success: false,
    message
  };
  
  if (errors && errors.length > 0) {
    response.errors = errors;
  }
  
  if (field) {
    response.field = field;
  }
  
  return res.status(statusCode).json(response);
};

// Register route (Step 1 - Send OTP)
router.post('/register', otpRateLimit, registerValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Validation failed', formatValidationErrors(errors.array()));
    }

    const { name, email, password } = req.body;

    // Additional server-side validation
    if (name.trim().length === 0) {
      return sendErrorResponse(res, 400, 'Name cannot be empty', [], 'name');
    }

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return sendErrorResponse(res, 409, 'An account with this email already exists', [], 'email');
    }

    // Check rate limiting for OTP
    if (existingUser && !canSendOTP(existingUser.lastOtpSent)) {
      const timeLeft = 60 - Math.floor((new Date().getTime() - existingUser.lastOtpSent!.getTime()) / 1000);
      return sendErrorResponse(res, 429, `Please wait ${timeLeft} seconds before requesting another OTP`, [], 'otp');
    }

    // Hash password with enhanced security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes instead of 10

    if (existingUser) {
      // Update existing unverified user
      existingUser.name = name.trim();
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      existingUser.otpAttempts = 0;
      existingUser.lastOtpSent = new Date();
      await existingUser.save();
    } else {
      // Create new user
      const user = new User({
        name: name.trim(),
        email,
        password: hashedPassword,
        isGoogleUser: false,
        isEmailVerified: false,
        otp,
        otpExpires,
        otpAttempts: 0,
        lastOtpSent: new Date()
      });
      await user.save();
    }

    // Send OTP email
    const emailSent = await emailService.sendOtpEmail(email, name.trim(), otp);
    
    if (!emailSent) {
      return sendErrorResponse(res, 500, 'Failed to send verification email. Please try again.', [], 'email');
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email. Code expires in 3 minutes.',
      email: email,
      expiresIn: 180 // 3 minutes in seconds
    });

  } catch (error) {
    console.error('Registration error:', error);
    return sendErrorResponse(res, 500, 'Internal server error. Please try again later.');
  }
});

// Verify OTP route (Step 2 - Complete registration)
router.post('/verify-otp', verificationRateLimit, otpValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Validation failed', formatValidationErrors(errors.array()));
    }

    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found. Please register first.', [], 'email');
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return sendErrorResponse(res, 400, 'Email is already verified. You can login now.', [], 'email');
    }

    // Check OTP attempts (enhanced security)
    if (user.otpAttempts >= 5) {
      // Lock the account temporarily and clear OTP
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      await user.save();
      
      return sendErrorResponse(res, 429, 'Too many failed attempts. Please request a new verification code.', [], 'otp');
    }

    // Check if OTP exists and hasn't expired
    if (!user.otp || !user.otpExpires) {
      return sendErrorResponse(res, 400, 'No verification code found. Please request a new one.', [], 'otp');
    }

    if (isOTPExpired(user.otpExpires)) {
      // Clear expired OTP
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      await user.save();
      
      return sendErrorResponse(res, 400, 'Verification code has expired. Please request a new one.', [], 'otp');
    }

    // Verify OTP with timing attack protection
    const isValidOTP = crypto.timingSafeEqual(
      Buffer.from(user.otp),
      Buffer.from(otp)
    );

    if (!isValidOTP) {
      user.otpAttempts += 1;
      await user.save();
      
      const attemptsLeft = 5 - user.otpAttempts;
      return sendErrorResponse(
        res, 
        400, 
        `Invalid verification code. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`, 
        [], 
        'otp'
      );
    }

    // OTP is valid - verify user
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.lastOtpSent = undefined;
    await user.save();

    // Generate JWT token with enhanced payload
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        isVerified: true,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to GYMSY!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isEmailVerified
      },
      token
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return sendErrorResponse(res, 500, 'Internal server error. Please try again later.');
  }
});

// Resend OTP route (Enhanced)
router.post('/resend-otp', otpRateLimit, emailValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Validation failed', formatValidationErrors(errors.array()));
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found. Please register first.', [], 'email');
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return sendErrorResponse(res, 400, 'Email is already verified. You can login now.', [], 'email');
    }

    // Check rate limiting with more detailed feedback
    if (!canSendOTP(user.lastOtpSent)) {
      const timeLeft = 60 - Math.floor((new Date().getTime() - user.lastOtpSent!.getTime()) / 1000);
      return sendErrorResponse(res, 429, `Please wait ${timeLeft} seconds before requesting another code.`, [], 'resend');
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0; // Reset attempts
    user.lastOtpSent = new Date();
    await user.save();

    // Send OTP email
    const emailSent = await emailService.sendOtpEmail(email, user.name, otp);
    
    if (!emailSent) {
      return sendErrorResponse(res, 500, 'Failed to send verification email. Please try again.', [], 'email');
    }

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email. Code expires in 3 minutes.',
      expiresIn: 180 // 3 minutes in seconds
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return sendErrorResponse(res, 500, 'Internal server error. Please try again later.');
  }
});

// Enhanced Login route
router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Validation failed', formatValidationErrors(errors.array()));
    }

    const { email, password } = req.body;

    // Find user with enhanced query
    const user = await User.findOne({ email }).select('+password');
    if (!user || user.isGoogleUser) {
      return sendErrorResponse(res, 401, 'Invalid email or password', [], 'credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: email
      });
    }

    // Check password with timing attack protection
    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      return sendErrorResponse(res, 401, 'Invalid email or password', [], 'credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        isVerified: user.isEmailVerified,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isEmailVerified
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return sendErrorResponse(res, 500, 'Internal server error. Please try again later.');
  }
});

// Enhanced email check route
router.post('/check-email', emailValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Validation failed', formatValidationErrors(errors.array()));
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    
    res.json({
      success: true,
      exists: !!user,
      isGoogleUser: user ? user.isGoogleUser : false,
      isVerified: user ? user.isEmailVerified : false
    });
  } catch (error) {
    console.error('Check email error:', error);
    return sendErrorResponse(res, 500, 'Internal server error. Please try again later.');
  }
});

// Health check for OTP system
router.get('/otp-status/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendErrorResponse(res, 400, 'Invalid email format', [], 'email');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.json({
        success: true,
        hasOTP: false,
        isVerified: false
      });
    }

    const hasValidOTP = user.otp && user.otpExpires && !isOTPExpired(user.otpExpires);
    const canRequestNew = canSendOTP(user.lastOtpSent);
    
    res.json({
      success: true,
      hasOTP: hasValidOTP,
      isVerified: user.isEmailVerified,
      canRequestNew,
      attemptsLeft: Math.max(0, 5 - user.otpAttempts),
      timeUntilResend: canRequestNew ? 0 : Math.max(0, 60 - Math.floor((new Date().getTime() - (user.lastOtpSent?.getTime() || 0)) / 1000))
    });

  } catch (error) {
    console.error('OTP status error:', error);
    return sendErrorResponse(res, 500, 'Internal server error. Please try again later.');
  }
});

export default router;