// server/src/models/UserWorkoutProgress.ts - User Progress Tracking Model
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserWorkoutProgress extends Document {
  userId: mongoose.Types.ObjectId;
  workoutId: mongoose.Types.ObjectId;
  
  // Overall progress
  isStarted: boolean;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  
  // Current position
  currentWeek: number;
  currentDay: number;
  totalWeeks: number;
  totalDaysPerWeek: number;
  
  // Completed days tracking
  completedDays: Array<{
    week: number;
    day: number;
    completedAt: Date;
    duration: number; // actual workout duration in minutes
    caloriesBurned?: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    notes?: string;
    sessionId?: string;
  }>;
  
  // Completed weeks
  completedWeeks: number[];
  
  // Statistics
  totalCompletedDays: number;
  consecutiveDays: number;
  totalTimeSpent: number; // in minutes
  totalCaloriesBurned: number;
  averageDifficulty: number; // 1-5 scale
  
  // Streak tracking
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: Date;
  
  // Settings & Preferences
  reminderTime?: string; // HH:MM format
  isReminderEnabled: boolean;
  preferredWorkoutTime?: 'morning' | 'afternoon' | 'evening';
  
  // Bookmarking
  isBookmarked: boolean;
  bookmarkedAt?: Date;
  
  // Rating & Review
  userRating?: number; // 1-5 stars
  userReview?: string;
  ratedAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  completionPercentage: number;
  nextWorkoutDay: {
    week: number;
    day: number;
    isUnlocked: boolean;
  } | null;
  weeklyProgress: Array<{
    week: number;
    completedDays: number;
    totalDays: number;
    isCompleted: boolean;
    isUnlocked: boolean;
    completionPercentage: number;
  }>;
  
  // Methods
  updateStreak(): void;
  completeDay(
    week: number,
    day: number,
    duration: number,
    difficulty: 'Easy' | 'Medium' | 'Hard',
    caloriesBurned?: number,
    notes?: string,
    sessionId?: string
  ): Promise<IUserWorkoutProgress>;
  toggleBookmark(): Promise<IUserWorkoutProgress>;
  rateWorkout(rating: number, review?: string): Promise<IUserWorkoutProgress>;
}

// Extend the model interface for static methods
export interface IUserWorkoutProgressModel extends mongoose.Model<IUserWorkoutProgress> {
  getUserOverview(userId: string): mongoose.Aggregate<any[]>;
  getWorkoutStats(workoutId: string): mongoose.Aggregate<any[]>;
}

const userWorkoutProgressSchema = new Schema<IUserWorkoutProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  workoutId: {
    type: Schema.Types.ObjectId,
    ref: 'Workout',
    required: true,
    index: true
  },
  
  // Overall progress
  isStarted: {
    type: Boolean,
    default: false,
    index: true
  },
  isCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  lastAccessedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Current position
  currentWeek: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  currentDay: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 7
  },
  totalWeeks: {
    type: Number,
    required: true,
    min: 1,
    max: 52
  },
  totalDaysPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  
  // Completed days tracking
  completedDays: [{
    week: {
      type: Number,
      required: true,
      min: 1
    },
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 7
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    caloriesBurned: {
      type: Number,
      min: 0
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    },
    notes: {
      type: String,
      maxlength: 500
    },
    sessionId: {
      type: String
    }
  }],
  
  // Completed weeks
  completedWeeks: [{
    type: Number,
    min: 1
  }],
  
  // Statistics
  totalCompletedDays: {
    type: Number,
    default: 0,
    min: 0
  },
  consecutiveDays: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCaloriesBurned: {
    type: Number,
    default: 0,
    min: 0
  },
  averageDifficulty: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  // Streak tracking
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastWorkoutDate: {
    type: Date
  },
  
  // Settings & Preferences
  reminderTime: {
    type: String,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format validation
  },
  isReminderEnabled: {
    type: Boolean,
    default: false
  },
  preferredWorkoutTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening']
  },
  
  // Bookmarking
  isBookmarked: {
    type: Boolean,
    default: false,
    index: true
  },
  bookmarkedAt: {
    type: Date
  },
  
  // Rating & Review
  userRating: {
    type: Number,
    min: 1,
    max: 5
  },
  userReview: {
    type: String,
    maxlength: 1000
  },
  ratedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient querying
userWorkoutProgressSchema.index({ userId: 1, workoutId: 1 }, { unique: true });
userWorkoutProgressSchema.index({ userId: 1, isStarted: 1, isCompleted: 1 });
userWorkoutProgressSchema.index({ userId: 1, isBookmarked: 1 });
userWorkoutProgressSchema.index({ userId: 1, lastAccessedAt: -1 });
userWorkoutProgressSchema.index({ workoutId: 1, isCompleted: 1 });

// Virtual for completion percentage
userWorkoutProgressSchema.virtual('completionPercentage').get(function(this: IUserWorkoutProgress) {
  const totalDays = this.totalWeeks * this.totalDaysPerWeek;
  return totalDays > 0 ? Math.round((this.totalCompletedDays / totalDays) * 100) : 0;
});

// Virtual for next workout day
userWorkoutProgressSchema.virtual('nextWorkoutDay').get(function(this: IUserWorkoutProgress) {
  if (this.isCompleted) return null;
  
  // Find the current position based on completed days
  const currentDayKey = `${this.currentWeek}-${this.currentDay}`;
  const isCurrentDayCompleted = this.completedDays.some(
    day => `${day.week}-${day.day}` === currentDayKey
  );
  
  if (!isCurrentDayCompleted) {
    return {
      week: this.currentWeek,
      day: this.currentDay,
      isUnlocked: true
    };
  }
  
  // Find next day
  let nextDay = this.currentDay + 1;
  let nextWeek = this.currentWeek;
  
  if (nextDay > this.totalDaysPerWeek) {
    nextDay = 1;
    nextWeek += 1;
  }
  
  if (nextWeek > this.totalWeeks) {
    return null; // Workout plan completed
  }
  
  return {
    week: nextWeek,
    day: nextDay,
    isUnlocked: true
  };
});

// Virtual for weekly progress
userWorkoutProgressSchema.virtual('weeklyProgress').get(function(this: IUserWorkoutProgress) {
  const weekProgress = [];
  
  for (let week = 1; week <= this.totalWeeks; week++) {
    const weekDays = this.completedDays.filter(day => day.week === week);
    const isCompleted = weekDays.length === this.totalDaysPerWeek;
    const isUnlocked = week <= this.currentWeek + 1;
    
    weekProgress.push({
      week,
      completedDays: weekDays.length,
      totalDays: this.totalDaysPerWeek,
      isCompleted,
      isUnlocked,
      completionPercentage: Math.round((weekDays.length / this.totalDaysPerWeek) * 100)
    });
  }
  
  return weekProgress;
});

// Pre-save middleware to update statistics
userWorkoutProgressSchema.pre('save', function(this: IUserWorkoutProgress, next) {
  // Update total completed days
  this.totalCompletedDays = this.completedDays.length;
  
  // Update total time spent and calories burned
  this.totalTimeSpent = this.completedDays.reduce((total, day) => total + day.duration, 0);
  this.totalCaloriesBurned = this.completedDays.reduce((total, day) => total + (day.caloriesBurned || 0), 0);
  
  // Update average difficulty
  if (this.completedDays.length > 0) {
    const difficultyMap = { 'Easy': 1, 'Medium': 3, 'Hard': 5 };
    const totalDifficulty = this.completedDays.reduce((total, day) => total + difficultyMap[day.difficulty], 0);
    this.averageDifficulty = totalDifficulty / this.completedDays.length;
  }
  
  // Update completed weeks
  const completedWeeksSet = new Set<number>();
  for (let week = 1; week <= this.totalWeeks; week++) {
    const weekDays = this.completedDays.filter(day => day.week === week);
    if (weekDays.length === this.totalDaysPerWeek) {
      completedWeeksSet.add(week);
    }
  }
  this.completedWeeks = Array.from(completedWeeksSet);
  
  // Check if workout is completed
  this.isCompleted = this.totalCompletedDays === (this.totalWeeks * this.totalDaysPerWeek);
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Update current position
  if (this.completedDays.length > 0 && !this.isCompleted) {
    const lastCompletedDay = this.completedDays
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
    
    // Find next available day
    let nextWeek = lastCompletedDay.week;
    let nextDay = lastCompletedDay.day + 1;
    
    if (nextDay > this.totalDaysPerWeek) {
      nextDay = 1;
      nextWeek += 1;
    }
    
    if (nextWeek <= this.totalWeeks) {
      this.currentWeek = nextWeek;
      this.currentDay = nextDay;
    }
  }
  
  // Update streak information
  this.updateStreak();
  
  // Update last accessed time
  this.lastAccessedAt = new Date();
  
  next();
});

// Method to update streak information
userWorkoutProgressSchema.methods.updateStreak = function(this: IUserWorkoutProgress) {
  if (this.completedDays.length === 0) {
    this.currentStreak = 0;
    this.longestStreak = 0;
    return;
  }
  
  // Sort completed days by date
  const sortedDays = this.completedDays
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
  
  let currentStreak = 1;
  let longestStreak = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const currentDay = new Date(sortedDays[i].completedAt);
    const previousDay = new Date(sortedDays[i - 1].completedAt);
    
    // Calculate days between workouts
    const daysDifference = Math.floor((currentDay.getTime() - previousDay.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference <= 2) { // Allow 1 day gap for rest days
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    
    longestStreak = Math.max(longestStreak, currentStreak);
  }
  
  // Check if current streak is still active (within last 3 days)
  const lastWorkoutDate = new Date(sortedDays[sortedDays.length - 1].completedAt);
  const daysSinceLastWorkout = Math.floor((Date.now() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
  
  this.currentStreak = daysSinceLastWorkout <= 3 ? currentStreak : 0;
  this.longestStreak = longestStreak;
  this.lastWorkoutDate = lastWorkoutDate;
};

// Method to complete a workout day
userWorkoutProgressSchema.methods.completeDay = function(
  this: IUserWorkoutProgress,
  week: number,
  day: number,
  duration: number,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  caloriesBurned?: number,
  notes?: string,
  sessionId?: string
) {
  // Check if day is already completed
  const existingDay = this.completedDays.find(d => d.week === week && d.day === day);
  if (existingDay) {
    throw new Error('This workout day has already been completed');
  }
  
  // Validate week and day
  if (week < 1 || week > this.totalWeeks) {
    throw new Error('Invalid week number');
  }
  if (day < 1 || day > this.totalDaysPerWeek) {
    throw new Error('Invalid day number');
  }
  
  // Add completed day
  this.completedDays.push({
    week,
    day,
    completedAt: new Date(),
    duration,
    caloriesBurned,
    difficulty,
    notes,
    sessionId
  });
  
  // Mark as started if this is the first day
  if (!this.isStarted) {
    this.isStarted = true;
  }
  
  return this.save();
};

// Method to bookmark/unbookmark workout
userWorkoutProgressSchema.methods.toggleBookmark = function(this: IUserWorkoutProgress) {
  this.isBookmarked = !this.isBookmarked;
  this.bookmarkedAt = this.isBookmarked ? new Date() : undefined;
  return this.save();
};

// Method to rate workout
userWorkoutProgressSchema.methods.rateWorkout = function(
  this: IUserWorkoutProgress,
  rating: number,
  review?: string
) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  this.userRating = rating;
  this.userReview = review;
  this.ratedAt = new Date();
  
  return this.save();
};

// Static method to get user's workout progress overview
userWorkoutProgressSchema.statics.getUserOverview = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        startedWorkouts: { $sum: { $cond: ['$isStarted', 1, 0] } },
        completedWorkouts: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        bookmarkedWorkouts: { $sum: { $cond: ['$isBookmarked', 1, 0] } },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
        totalCaloriesBurned: { $sum: '$totalCaloriesBurned' },
        totalCompletedDays: { $sum: '$totalCompletedDays' },
        averageRating: { $avg: '$userRating' },
        longestStreak: { $max: '$longestStreak' }
      }
    }
  ]);
};

// Static method to get workout statistics
userWorkoutProgressSchema.statics.getWorkoutStats = function(workoutId: string) {
  return this.aggregate([
    { $match: { workoutId: new mongoose.Types.ObjectId(workoutId) } },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        completedUsers: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        averageCompletionRate: { $avg: '$completionPercentage' },
        averageRating: { $avg: '$userRating' },
        totalRatings: { $sum: { $cond: [{ $ne: ['$userRating', null] }, 1, 0] } },
        averageTimeSpent: { $avg: '$totalTimeSpent' },
        bookmarkCount: { $sum: { $cond: ['$isBookmarked', 1, 0] } }
      }
    }
  ]);
};

export const UserWorkoutProgress = mongoose.model<IUserWorkoutProgress, IUserWorkoutProgressModel>('UserWorkoutProgress', userWorkoutProgressSchema);