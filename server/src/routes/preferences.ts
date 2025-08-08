// Create new file: server/src/routes/preferences.ts

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Interface for Mongoose validation error
interface MongooseValidationError {
  name: 'ValidationError';
  errors: Record<string, {
    path: string;
    message: string;
    value: any;
  }>;
}

// Interface for Mongoose duplicate key error
interface MongoDuplicateKeyError {
  code: 11000;
  keyValue: Record<string, any>;
}

// Validation rules for preferences
const preferencesValidation = [
  body('height')
    .isInt({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
  
  body('weight')
    .isInt({ min: 30, max: 200 })
    .withMessage('Weight must be between 30 and 200 kg'),
  
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120 years'),
  
  body('fitnessLevel')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid fitness level'),
  
  body('activityLevel')
    .isIn(['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'])
    .withMessage('Invalid activity level'),
  
  body('fitnessGoals')
    .isArray({ min: 1 })
    .withMessage('At least one fitness goal must be selected'),
  
  body('fitnessGoals.*')
    .isIn(['Lose Fat', 'Gain Muscle', 'Build Strength', 'Improve Endurance', 'Increase Flexibility', 'Maintain Fitness'])
    .withMessage('Invalid fitness goal'),
  
  body('timeAvailability.minutesPerDay')
    .isInt({ min: 15, max: 120 })
    .withMessage('Minutes per day must be between 15 and 120'),
  
  body('timeAvailability.daysPerWeek')
    .isInt({ min: 1, max: 7 })
    .withMessage('Days per week must be between 1 and 7'),
  
  body('planDuration')
    .isIn(['2 weeks', '4 weeks', '6 weeks', '8+ weeks'])
    .withMessage('Invalid plan duration'),
  
  body('workoutEnvironment')
    .isIn(['Home', 'Gym', 'No equipment', 'With dumbbells/bands only'])
    .withMessage('Invalid workout environment')
];

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

// Format validation errors
const formatValidationErrors = (errors: any[]): any[] => {
  return errors.map((error: any) => ({
    field: error.path || error.param || 'general',
    message: error.msg || 'Validation error',
    value: error.value || null
  }));
};

// Type guard to check if error is an Error object
const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

// Type guard for Mongoose validation errors
const isMongooseValidationError = (error: unknown): error is MongooseValidationError => {
  return typeof error === 'object' && 
         error !== null && 
         'name' in error && 
         'errors' in error &&
         (error as any).name === 'ValidationError';
};

// Type guard for MongoDB duplicate key errors
const isMongoDuplicateKeyError = (error: unknown): error is MongoDuplicateKeyError => {
  return typeof error === 'object' && 
         error !== null && 
         'code' in error &&
         (error as any).code === 11000;
};

// Get user preferences
router.get('/get', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    // Check if user has set preferences (at least basic required fields)
    const hasPreferences = !!(
      user.height && 
      user.weight && 
      user.fitnessLevel && 
      user.activityLevel && 
      user.fitnessGoals && 
      user.fitnessGoals.length > 0
    );

    if (!hasPreferences) {
      return res.json({
        success: true,
        data: {
          hasPreferences: false
        }
      });
    }

    const preferences = {
      height: user.height,
      weight: user.weight,
      age: user.age,
      fitnessLevel: user.fitnessLevel,
      activityLevel: user.activityLevel,
      fitnessGoals: user.fitnessGoals,
      timeAvailability: {
        minutesPerDay: user.timeAvailability?.minutesPerDay || 30,
        daysPerWeek: user.timeAvailability?.daysPerWeek || 3
      },
      planDuration: user.planDuration || '4 weeks',
      workoutEnvironment: user.workoutEnvironment || 'Gym'
    };

    res.json({
      success: true,
      data: {
        hasPreferences: true,
        preferences
      }
    });

  } catch (error: unknown) {
    console.error('Get preferences error:', error);
    const errorMessage = isError(error) ? error.message : 'Unknown error occurred';
    return sendErrorResponse(res, 500, 'Internal server error. Please try again later.');
  }
});

// Check if user has preferences (lightweight endpoint)
router.get('/check', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const user = await User.findById(userId).select('height weight fitnessLevel activityLevel fitnessGoals');
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    const hasPreferences = !!(
      user.height && 
      user.weight && 
      user.fitnessLevel && 
      user.activityLevel && 
      user.fitnessGoals && 
      user.fitnessGoals.length > 0
    );

    res.json({
      success: true,
      data: {
        hasPreferences
      }
    });

  } catch (error: unknown) {
    console.error('Check preferences error:', error);
    const errorMessage = isError(error) ? error.message : 'Unknown error occurred';
    return sendErrorResponse(res, 500, 'Internal server error. Please try again later.');
  }
});

// Save user preferences
router.post('/save', authenticateToken, preferencesValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Validation failed', formatValidationErrors(errors.array()));
    }

    const userId = (req as any).user.userId;
    const {
      height,
      weight,
      age,
      fitnessLevel,
      activityLevel,
      fitnessGoals,
      timeAvailability,
      planDuration,
      workoutEnvironment
    } = req.body;

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    // Update user preferences
    user.height = height;
    user.weight = weight;
    user.age = age;
    user.fitnessLevel = fitnessLevel;
    user.activityLevel = activityLevel;
    user.fitnessGoals = fitnessGoals;
    user.timeAvailability = timeAvailability;
    user.planDuration = planDuration;
    user.workoutEnvironment = workoutEnvironment;

    await user.save();

    res.json({
      success: true,
      message: 'Preferences saved successfully!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          hasPreferences: true
        }
      }
    });

  } catch (error: unknown) {
    console.error('Save preferences error:', error);
    const errorMessage = isError(error) ? error.message : 'Unknown error occurred';
    return sendErrorResponse(res, 500, 'Internal server error. Please try again later.');
  }
});

// Update specific preferences (partial update)
router.patch('/update', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const updates = req.body;

    // Define allowed fields for partial update
    const allowedFields = [
      'height', 'weight', 'age', 'fitnessLevel', 'activityLevel', 
      'fitnessGoals', 'timeAvailability', 'planDuration', 'workoutEnvironment'
    ];

    // Filter out non-allowed fields
    const validUpdates = Object.keys(updates).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = updates[key];
      }
      return acc;
    }, {} as any);

    if (Object.keys(validUpdates).length === 0) {
      return sendErrorResponse(res, 400, 'No valid fields to update');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      validUpdates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          hasPreferences: true
        }
      }
    });

  } catch (error: unknown) {
    console.error('Update preferences error:', error);
    
    // Handle validation errors
    if (isMongooseValidationError(error)) {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return sendErrorResponse(res, 400, 'Validation failed', validationErrors);
    }

    // Handle duplicate key errors
    if (isMongoDuplicateKeyError(error)) {
      const field = Object.keys(error.keyValue)[0];
      return sendErrorResponse(res, 409, `${field} already exists`, undefined, field);
    }

    const errorMessage = isError(error) ? error.message : 'Unknown error occurred';
    return sendErrorResponse(res, 500, 'Internal server error. Please try again later.');
  }
});

export default router;