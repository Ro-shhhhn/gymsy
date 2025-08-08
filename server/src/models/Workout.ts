// server/src/models/Workout.ts - Fixed parallel array index issue
import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkout extends Document {
  title: string;
  description: string;
  goal: 'Fat Loss' | 'Muscle Gain' | 'Strength' | 'Endurance' | 'Flexibility' | 'General Fitness';
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // Total workout time in minutes
  focusAreas: string[]; // e.g., ['Arms', 'Core', 'Legs']
  workoutType: 'Home' | 'Gym' | 'No Equipment' | 'Dumbbells/Bands Only';
  caloriesBurnEstimate: number;
  planDuration: '2 weeks' | '4 weeks' | '6 weeks' | '8+ weeks';
  
  // Enhanced categorization fields
  category: 'Challenge' | 'HIIT' | 'Strength' | 'Cardio' | 'Flexibility' | 'Beginner' | 'Quick' | 'General';
  subcategory?: string; // e.g., 'Abs Beginner', 'Arms Intermediate'
  workoutStyle: 'Circuit' | 'Traditional' | 'AMRAP' | 'EMOM' | 'Tabata' | 'Pyramid' | 'Ladder' | 'Custom';
  
  // Exercise details
  exercises: Array<{
    name: string;
    sets: number;
    reps?: number;
    duration?: number; // for time-based exercises in seconds
    restTime: number; // in seconds
    instructions?: string;
    targetMuscles: string[];
    equipment?: string[];
    video?: string; // URL to exercise demo video
    image?: string; // URL to exercise illustration
  }>;
  
  // Weekly schedule
  workoutsPerWeek: number;
  schedule?: Array<{
    day: number; // 1-7 (Monday-Sunday)
    exercises: number[]; // indices of exercises for this day
  }>;
  
  // Media and engagement
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string; // For better loading performance
  tags: string[]; // for additional filtering
  difficulty: 1 | 2 | 3 | 4 | 5; // 1 = Very Easy, 5 = Very Hard
  rating: number; // Average rating 1-5
  totalRatings: number;
  
  // Enhanced admin/creator info
  createdBy: 'Admin' | 'AI' | 'Professional' | 'Community';
  creatorId?: string; // Reference to the creator
  isPublished: boolean;
  isFeatured: boolean;
  isChallenge: boolean; // Special flag for challenge workouts
  isPremium: boolean; // For potential premium content
  
  // SEO and searchability
  seoKeywords: string[]; // Better search optimization
  shortDescription: string; // For cards and previews
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  lastModifiedBy?: string;
}

const workoutSchema = new Schema<IWorkout>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000 // Increased for more detailed descriptions
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  goal: {
    type: String,
    required: true,
    enum: ['Fat Loss', 'Muscle Gain', 'Strength', 'Endurance', 'Flexibility', 'General Fitness'],
    index: true
  },
  fitnessLevel: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    index: true
  },
  duration: {
    type: Number,
    required: true,
    min: 5,
    max: 180,
    index: true
  },
  focusAreas: [{
    type: String,
    required: true,
    enum: [
      'Full Body', 'Upper Body', 'Lower Body', 'Core', 'Arms', 'Chest', 
      'Back', 'Shoulders', 'Legs', 'Glutes', 'Abs', 'Cardio', 'Calves',
      'Biceps', 'Triceps', 'Forearms', 'Quads', 'Hamstrings', 'Hip Flexors'
    ],
    index: true
  }],
  workoutType: {
    type: String,
    required: true,
    enum: ['Home', 'Gym', 'No Equipment', 'Dumbbells/Bands Only'],
    index: true
  },
  caloriesBurnEstimate: {
    type: Number,
    required: true,
    min: 30,
    max: 1500
  },
  planDuration: {
    type: String,
    required: true,
    enum: ['2 weeks', '4 weeks', '6 weeks', '8+ weeks'],
    index: true
  },
  
  // Enhanced categorization
  category: {
    type: String,
    required: true,
    enum: ['Challenge', 'HIIT', 'Strength', 'Cardio', 'Flexibility', 'Beginner', 'Quick', 'General'],
    default: 'General',
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 50
  },
  workoutStyle: {
    type: String,
    required: true,
    enum: ['Circuit', 'Traditional', 'AMRAP', 'EMOM', 'Tabata', 'Pyramid', 'Ladder', 'Custom'],
    default: 'Traditional'
  },
  
  exercises: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    sets: {
      type: Number,
      required: true,
      min: 1,
      max: 20
    },
    reps: {
      type: Number,
      min: 1,
      max: 200
    },
    duration: {
      type: Number, // in seconds
      min: 5,
      max: 600
    },
    restTime: {
      type: Number,
      required: true,
      min: 0,
      max: 600
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: 500
    },
    targetMuscles: [{
      type: String,
      required: true,
      maxlength: 50
    }],
    equipment: [{
      type: String,
      maxlength: 50
    }],
    video: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    }
  }],
  
  workoutsPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  schedule: [{
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 7
    },
    exercises: [{
      type: Number,
      required: true
    }]
  }],
  
  imageUrl: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 30
  }],
  seoKeywords: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 50
  }],
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Enhanced creator info
  createdBy: {
    type: String,
    required: true,
    enum: ['Admin', 'AI', 'Professional', 'Community'],
    default: 'Admin',
    index: true
  },
  creatorId: {
    type: String,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isChallenge: {
    type: Boolean,
    default: false,
    index: true
  },
  isPremium: {
    type: Boolean,
    default: false,
    index: true
  },
  
  publishedAt: {
    type: Date
  },
  lastModifiedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient filtering and sorting
workoutSchema.index({ goal: 1, fitnessLevel: 1, workoutType: 1 });
workoutSchema.index({ category: 1, subcategory: 1 });
workoutSchema.index({ focusAreas: 1, difficulty: 1 });
workoutSchema.index({ planDuration: 1, duration: 1 });
workoutSchema.index({ rating: -1, totalRatings: -1 });
workoutSchema.index({ createdAt: -1, isPublished: 1 });
workoutSchema.index({ isPublished: 1, isFeatured: -1, createdAt: -1 });

// FIXED: Separate indexes for array fields instead of compound index
workoutSchema.index({ tags: 1 });
workoutSchema.index({ seoKeywords: 1 });

// Text search index for better searchability
workoutSchema.index({
  title: 'text',
  description: 'text',
  shortDescription: 'text',
  tags: 'text',
  seoKeywords: 'text'
}, {
  weights: {
    title: 10,
    shortDescription: 5,
    description: 3,
    tags: 2,
    seoKeywords: 1
  }
});

// Virtual for average rating display
workoutSchema.virtual('averageRating').get(function(this: IWorkout) {
  return this.totalRatings > 0 ? Math.round((this.rating / this.totalRatings) * 10) / 10 : 0;
});

// Virtual for total exercises count
workoutSchema.virtual('totalExercises').get(function(this: IWorkout) {
  return this.exercises.length;
});

// Virtual for estimated workout completion time (including rest)
workoutSchema.virtual('estimatedCompletionTime').get(function(this: IWorkout) {
  const exerciseTime = this.exercises.reduce((total, exercise) => {
    const exerciseDuration = exercise.duration || (exercise.reps ? exercise.reps * 3 : 0); // Estimate 3 seconds per rep
    return total + (exerciseDuration * exercise.sets) + (exercise.restTime * (exercise.sets - 1));
  }, 0);
  return Math.ceil(exerciseTime / 60); // Convert to minutes
});

// Pre-save middleware to set published date
workoutSchema.pre('save', function(next) {
  if (this.isNew && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Pre-save middleware to auto-categorize based on content
workoutSchema.pre('save', function(next) {
  // Auto-set category based on other fields if not explicitly set
  if (this.isModified('goal') || this.isModified('duration') || this.isModified('tags') || this.isNew) {
    if (this.isFeatured || this.isChallenge) {
      this.category = 'Challenge';
    } else if (this.duration <= 30) {
      this.category = 'Quick';
    } else if (this.tags.some(tag => tag.toLowerCase().includes('hiit')) || this.workoutStyle === 'Tabata') {
      this.category = 'HIIT';
    } else if (this.goal === 'Strength' || this.goal === 'Muscle Gain') {
      this.category = 'Strength';
    } else if (this.goal === 'Fat Loss' || this.focusAreas.includes('Cardio')) {
      this.category = 'Cardio';
    } else if (this.goal === 'Flexibility') {
      this.category = 'Flexibility';
    } else if (this.fitnessLevel === 'Beginner') {
      this.category = 'Beginner';
    } else {
      this.category = 'General';
    }

    // Auto-set subcategory for body focus workouts
    if (this.focusAreas.length === 1 && this.focusAreas[0] !== 'Full Body') {
      this.subcategory = `${this.focusAreas[0]} ${this.fitnessLevel}`;
    }
  }
  next();
});

// Static method to get workout categories for filtering
workoutSchema.statics.getCategories = function() {
  return [
    { key: 'Challenge', name: 'Challenges', icon: 'Award' },
    { key: 'HIIT', name: 'HIIT Workouts', icon: 'Zap' },
    { key: 'Strength', name: 'Strength Training', icon: 'Dumbbell' },
    { key: 'Cardio', name: 'Cardio & Fat Loss', icon: 'Activity' },
    { key: 'Flexibility', name: 'Flexibility & Mobility', icon: 'Heart' },
    { key: 'Beginner', name: 'Beginner Friendly', icon: 'Star' },
    { key: 'Quick', name: 'Quick Workouts', icon: 'Clock' },
    { key: 'General', name: 'General Fitness', icon: 'Target' }
  ];
};

// Static method to get popular filter combinations
workoutSchema.statics.getPopularFilters = function() {
  return [
    {
      name: 'Quick Fat Burner',
      filters: { goal: 'Fat Loss', maxDuration: 30, category: 'Quick' }
    },
    {
      name: 'Beginner Strength',
      filters: { goal: 'Strength', fitnessLevel: 'Beginner', category: 'Strength' }
    },
    {
      name: 'Home HIIT',
      filters: { workoutType: 'Home', category: 'HIIT' }
    },
    {
      name: 'Core Challenge',
      filters: { focusAreas: ['Core', 'Abs'], category: 'Challenge' }
    },
    {
      name: 'No Equipment',
      filters: { workoutType: 'No Equipment' }
    }
  ];
};

export const Workout = mongoose.model<IWorkout>('Workout', workoutSchema);