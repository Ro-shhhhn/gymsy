import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkout extends Document {
  title: string;
  description: string;
  goal: 'Fat Loss' | 'Muscle Gain' | 'Strength' | 'Endurance' | 'Flexibility' | 'General Fitness';
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  focusAreas: string[];
  workoutType: 'Home' | 'Gym' | 'No Equipment' | 'Dumbbells/Bands Only';
  caloriesBurnEstimate: number;
  planDuration: '2 weeks' | '4 weeks' | '6 weeks' | '8+ weeks';
  
  category: 'Challenge' | 'HIIT' | 'Strength' | 'Cardio' | 'Flexibility' | 'Beginner' | 'Quick' | 'General';
  subcategory?: string;
  workoutStyle: 'Circuit' | 'Traditional' | 'AMRAP' | 'EMOM' | 'Tabata' | 'Pyramid' | 'Ladder' | 'Custom';
  
  exercises: Array<{
    name: string;
    sets: number;
    reps?: number;
    duration?: number;
    restTime: number;
    instructions?: string;
    targetMuscles: string[];
    equipment?: string[];
    video?: string;
    image?: string;
  }>;
  
  workoutsPerWeek: number;
  schedule?: Array<{
    day: number;
    exercises: number[];
  }>;
  
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  rating: number;
  totalRatings: number;
  
  createdBy: 'System' | 'AI' | 'Professional' | 'Community';
  creatorId?: string;
  isPublished: boolean;
  isFeatured: boolean;
  isChallenge: boolean;
  isPremium: boolean;
  
  seoKeywords: string[];
  shortDescription: string;
  
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
    maxlength: 1000
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
      type: Number,
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
  
  createdBy: {
    type: String,
    required: true,
    enum: ['System', 'AI', 'Professional', 'Community'],
    default: 'System',
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

workoutSchema.index({ goal: 1, fitnessLevel: 1, workoutType: 1 });
workoutSchema.index({ category: 1, subcategory: 1 });
workoutSchema.index({ focusAreas: 1, difficulty: 1 });
workoutSchema.index({ planDuration: 1, duration: 1 });
workoutSchema.index({ rating: -1, totalRatings: -1 });
workoutSchema.index({ createdAt: -1, isPublished: 1 });
workoutSchema.index({ isPublished: 1, isFeatured: -1, createdAt: -1 });

workoutSchema.index({ tags: 1 });
workoutSchema.index({ seoKeywords: 1 });

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

workoutSchema.virtual('averageRating').get(function(this: IWorkout) {
  return this.totalRatings > 0 ? Math.round((this.rating / this.totalRatings) * 10) / 10 : 0;
});

workoutSchema.virtual('totalExercises').get(function(this: IWorkout) {
  return this.exercises.length;
});

workoutSchema.virtual('estimatedCompletionTime').get(function(this: IWorkout) {
  const exerciseTime = this.exercises.reduce((total, exercise) => {
    const exerciseDuration = exercise.duration || (exercise.reps ? exercise.reps * 3 : 0);
    return total + (exerciseDuration * exercise.sets) + (exercise.restTime * (exercise.sets - 1));
  }, 0);
  return Math.ceil(exerciseTime / 60);
});

workoutSchema.pre('save', function(next) {
  if (this.isNew && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

workoutSchema.pre('save', function(next) {
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

    if (this.focusAreas.length === 1 && this.focusAreas[0] !== 'Full Body') {
      this.subcategory = `${this.focusAreas[0]} ${this.fitnessLevel}`;
    }
  }
  next();
});

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