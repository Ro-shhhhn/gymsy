// server/src/models/Exercise.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise extends Document {
  name: string;
  category: 'Strength' | 'Cardio' | 'Flexibility' | 'Balance' | 'Sports' | 'Functional';
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  
  instructions: {
    setup: string;
    execution: string[];
    breathing?: string;
    commonMistakes?: string[];
    modifications?: {
      easier: string[];
      harder: string[];
    };
  };
  
  mediaUrls: {
    image?: string;
    video?: string;
    animation?: string;
  };
  
  metrics: {
    avgCaloriesPerMinute: number;
    avgHeartRateIncrease: number;
  };
  
  alternatives: string[]; // Alternative exercise names/IDs
  tags: string[];
  
  isCompound: boolean; // Compound vs isolation exercise
  isUnilateral: boolean; // Single-limb exercise
  movementPattern: 'Push' | 'Pull' | 'Squat' | 'Hinge' | 'Lunge' | 'Carry' | 'Rotation' | 'Other';
  
  createdBy: 'System' | 'AI' | 'Professional' | 'Community';
  creatorId?: string;
  isPublished: boolean;
  isVerified: boolean; // Professional verification
  
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSchema = new Schema<IExercise>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Strength', 'Cardio', 'Flexibility', 'Balance', 'Sports', 'Functional'],
    index: true
  },
  primaryMuscles: [{
    type: String,
    required: true,
    enum: [
      'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
      'Core', 'Abs', 'Obliques', 'Lower Back',
      'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Hip Flexors',
      'Full Body', 'Cardio'
    ]
  }],
  secondaryMuscles: [{
    type: String,
    enum: [
      'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
      'Core', 'Abs', 'Obliques', 'Lower Back',
      'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Hip Flexors',
      'Full Body', 'Cardio'
    ]
  }],
  equipment: [{
    type: String,
    enum: [
      'None', 'Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar',
      'Kettlebell', 'Medicine Ball', 'Stability Ball', 'Bench',
      'Cable Machine', 'Smith Machine', 'Suspension Trainer',
      'Yoga Mat', 'Foam Roller', 'Bosu Ball', 'Battle Ropes'
    ]
  }],
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  
  instructions: {
    setup: {
      type: String,
      required: true,
      maxlength: 500
    },
    execution: [{
      type: String,
      required: true,
      maxlength: 200
    }],
    breathing: {
      type: String,
      maxlength: 200
    },
    commonMistakes: [{
      type: String,
      maxlength: 200
    }],
    modifications: {
      easier: [{
        type: String,
        maxlength: 200
      }],
      harder: [{
        type: String,
        maxlength: 200
      }]
    }
  },
  
  mediaUrls: {
    image: {
      type: String,
      trim: true
    },
    video: {
      type: String,
      trim: true
    },
    animation: {
      type: String,
      trim: true
    }
  },
  
  metrics: {
    avgCaloriesPerMinute: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    },
    avgHeartRateIncrease: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    }
  },
  
  alternatives: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 30
  }],
  
  isCompound: {
    type: Boolean,
    default: false,
    index: true
  },
  isUnilateral: {
    type: Boolean,
    default: false
  },
  movementPattern: {
    type: String,
    required: true,
    enum: ['Push', 'Pull', 'Squat', 'Hinge', 'Lunge', 'Carry', 'Rotation', 'Other'],
    index: true
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
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
exerciseSchema.index({ category: 1, difficulty: 1 });
exerciseSchema.index({ primaryMuscles: 1, equipment: 1 });
exerciseSchema.index({ isCompound: 1, movementPattern: 1 });
exerciseSchema.index({ isPublished: 1, isVerified: -1, createdAt: -1 });

// Text search index
exerciseSchema.index({
  name: 'text',
  'instructions.setup': 'text',
  tags: 'text'
}, {
  weights: {
    name: 10,
    tags: 3,
    'instructions.setup': 1
  }
});

// Virtual for exercise complexity score
exerciseSchema.virtual('complexityScore').get(function(this: IExercise) {
  let score = this.difficulty * 2;
  if (this.isCompound) score += 2;
  if (this.isUnilateral) score += 1;
  if (this.equipment.length > 1) score += 1;
  return Math.min(score, 10);
});

// Static methods
exerciseSchema.statics.getByMuscleGroup = function(muscleGroup: string) {
  return this.find({
    $or: [
      { primaryMuscles: muscleGroup },
      { secondaryMuscles: muscleGroup }
    ],
    isPublished: true
  }).sort({ isVerified: -1, createdAt: -1 });
};

exerciseSchema.statics.getByEquipment = function(equipment: string[]) {
  return this.find({
    equipment: { $in: equipment },
    isPublished: true
  }).sort({ isVerified: -1, difficulty: 1 });
};

exerciseSchema.statics.getAlternatives = function(exerciseName: string, muscleGroup: string) {
  return this.find({
    name: { $ne: exerciseName },
    primaryMuscles: muscleGroup,
    isPublished: true
  }).limit(5).sort({ isVerified: -1, difficulty: 1 });
};

export const Exercise = mongoose.model<IExercise>('Exercise', exerciseSchema);