import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutSession extends Document {
  userId: mongoose.Types.ObjectId;
  workoutName: string;
  workoutType: 'Push' | 'Pull' | 'Legs' | 'Cardio' | 'Full Body' | 'Core' | 'Custom';
  exercises: {
    name: string;
    sets: number;
    reps?: number;
    weight?: number; // in kg
    duration?: number; // in seconds for time-based exercises
    restTime?: number; // in seconds
  }[];
  duration: number; // total workout duration in minutes
  caloriesBurned?: number;
  completedAt: Date;
  notes?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workoutSessionSchema = new Schema<IWorkoutSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  workoutName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  workoutType: {
    type: String,
    enum: ['Push', 'Pull', 'Legs', 'Cardio', 'Full Body', 'Core', 'Custom'],
    required: true
  },
  exercises: [{
    name: {
      type: String,
      required: true,
      trim: true
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
      max: 1000
    },
    weight: {
      type: Number,
      min: 0,
      max: 1000
    },
    duration: {
      type: Number,
      min: 1
    },
    restTime: {
      type: Number,
      min: 0,
      max: 600 // 10 minutes max rest
    }
  }],
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 300 // 5 hours max
  },
  caloriesBurned: {
    type: Number,
    min: 0,
    max: 2000
  },
  completedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  isCompleted: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
workoutSessionSchema.index({ userId: 1, completedAt: -1 });
workoutSessionSchema.index({ userId: 1, workoutType: 1 });
workoutSessionSchema.index({ completedAt: -1 });

export const WorkoutSession = mongoose.model<IWorkoutSession>('WorkoutSession', workoutSessionSchema);