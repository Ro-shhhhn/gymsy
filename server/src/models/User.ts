// Update your existing server/src/models/User.ts file with these additions:

import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  isGoogleUser: boolean;
  isEmailVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  otpAttempts: number;
  lastOtpSent?: Date;
  
  // Basic fitness-related fields
  fitnessLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  fitnessGoals?: string[];
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  targetWeight?: number; // in kg
  activityLevel?: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';
  
  // New detailed preference fields
  timeAvailability?: {
    minutesPerDay: number;
    daysPerWeek: number;
  };
  planDuration?: '2 weeks' | '4 weeks' | '6 weeks' | '8+ weeks';
  workoutEnvironment?: 'Home' | 'Gym' | 'No equipment' | 'With dumbbells/bands only';
  
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.isGoogleUser;
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  lastOtpSent: {
    type: Date
  },
  
  // Basic fitness-related fields
  fitnessLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  fitnessGoals: [{
    type: String,
    trim: true,
    enum: ['Lose Fat', 'Gain Muscle', 'Build Strength', 'Improve Endurance', 'Increase Flexibility', 'Maintain Fitness']
  }],
  age: {
    type: Number,
    min: 13,
    max: 120
  },
  weight: {
    type: Number,
    min: 30,
    max: 200
  },
  height: {
    type: Number,
    min: 100,
    max: 250
  },
  targetWeight: {
    type: Number,
    min: 30,
    max: 200
  },
  activityLevel: {
    type: String,
    enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active']
  },
  
  // New detailed preference fields
  timeAvailability: {
    minutesPerDay: {
      type: Number,
      min: 15,
      max: 120
    },
    daysPerWeek: {
      type: Number,
      min: 1,
      max: 7
    }
  },
  planDuration: {
    type: String,
    enum: ['2 weeks', '4 weeks', '6 weeks', '8+ weeks']
  },
  workoutEnvironment: {
    type: String,
    enum: ['Home', 'Gym', 'No equipment', 'With dumbbells/bands only']
  }
}, {
  timestamps: true
});

// Index for OTP cleanup
userSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

// Index for efficient user lookups
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

// Virtual property to check if user has complete preferences
userSchema.virtual('hasPreferences').get(function(this: IUser) {
  return !!(
    this.height && 
    this.weight && 
    this.fitnessLevel && 
    this.activityLevel && 
    this.fitnessGoals && 
    this.fitnessGoals.length > 0
  );
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export const User = mongoose.model<IUser>('User', userSchema);