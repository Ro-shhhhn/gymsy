// server/src/routes/workouts.ts
import express, { Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { Workout } from '../models/Workout';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Interface for query parameters
interface WorkoutQueryParams {
  page?: string;
  limit?: string;
  goal?: string;
  fitnessLevel?: string;
  workoutType?: string;
  focusAreas?: string | string[];
  planDuration?: string;
  minDuration?: string;
  maxDuration?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  featured?: string;
}

// Validation rules for workout queries
const workoutQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('goal').optional().isIn(['Fat Loss', 'Muscle Gain', 'Strength', 'Endurance', 'Flexibility', 'General Fitness']),
  query('fitnessLevel').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  query('workoutType').optional().isIn(['Home', 'Gym', 'No Equipment', 'Dumbbells/Bands Only']),
  query('planDuration').optional().isIn(['2 weeks', '4 weeks', '6 weeks', '8+ weeks']),
  query('minDuration').optional().isInt({ min: 10 }).withMessage('Minimum duration must be at least 10 minutes'),
  query('maxDuration').optional().isInt({ max: 120 }).withMessage('Maximum duration must be at most 120 minutes'),
  query('sortBy').optional().isIn(['createdAt', 'rating', 'duration', 'title', 'difficulty']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

// Enhanced error response helper
const sendErrorResponse = (res: Response, statusCode: number, message: string, errors?: any[]) => {
  const response: any = {
    success: false,
    message
  };
  
  if (errors && errors.length > 0) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

// Format validation errors
const formatValidationErrors = (errors: any[]): any[] => {
  return errors.map((error: any) => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value
  }));
};

// Get all published workouts with filtering and pagination
router.get('/premade', authenticateToken, workoutQueryValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Invalid query parameters', formatValidationErrors(errors.array()));
    }

    const {
      page = '1',
      limit = '12',
      goal,
      fitnessLevel,
      workoutType,
      focusAreas,
      planDuration,
      minDuration,
      maxDuration,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      featured
    } = req.query as WorkoutQueryParams;

    // Build query
    const query: any = { isPublished: true };

    // Add filters
    if (goal) query.goal = goal;
    if (fitnessLevel) query.fitnessLevel = fitnessLevel;
    if (workoutType) query.workoutType = workoutType;
    if (planDuration) query.planDuration = planDuration;
    if (featured === 'true') query.isFeatured = true;

    // Focus areas filter (can be multiple)
    if (focusAreas) {
      if (Array.isArray(focusAreas)) {
        query.focusAreas = { $in: focusAreas };
      } else {
        query.focusAreas = { $in: focusAreas.split(',') };
      }
    }

    // Duration range filter
    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration) query.duration.$gte = parseInt(minDuration);
      if (maxDuration) query.duration.$lte = parseInt(maxDuration);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // If sorting by rating, also sort by totalRatings to prioritize well-rated workouts
    if (sortBy === 'rating') {
      sort.totalRatings = -1;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with aggregation for better performance
    const [workouts, totalCount] = await Promise.all([
      Workout.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('-exercises.instructions -__v') // Exclude detailed instructions for list view
        .lean(),
      Workout.countDocuments(query)
    ]);

    // Add calculated fields
    const workoutsWithCalculatedFields = workouts.map((workout: any) => ({
      ...workout,
      averageRating: workout.totalRatings > 0 ? Math.round((workout.rating / workout.totalRatings) * 10) / 10 : 0,
      totalExercises: workout.exercises?.length || 0
    }));

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        workouts: workoutsWithCalculatedFields,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        filters: {
          goal,
          fitnessLevel,
          workoutType,
          focusAreas,
          planDuration,
          minDuration,
          maxDuration,
          search,
          featured
        }
      }
    });

  } catch (error: any) {
    console.error('Get workouts error:', error);
    return sendErrorResponse(res, 500, 'Failed to fetch workouts');
  }
});

// Get single workout by ID
router.get('/premade/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const workout = await Workout.findOne({ 
      _id: id, 
      isPublished: true 
    }).lean();

    if (!workout) {
      return sendErrorResponse(res, 404, 'Workout not found');
    }

    // Add calculated fields
    const workoutWithCalculatedFields = {
      ...workout,
      averageRating: workout.totalRatings > 0 ? Math.round((workout.rating / workout.totalRatings) * 10) / 10 : 0,
      totalExercises: workout.exercises?.length || 0
    };

    res.json({
      success: true,
      data: {
        workout: workoutWithCalculatedFields
      }
    });

  } catch (error: any) {
    console.error('Get workout by ID error:', error);
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 400, 'Invalid workout ID');
    }
    
    return sendErrorResponse(res, 500, 'Failed to fetch workout');
  }
});

// Get workout filter options (for dropdown menus)
router.get('/filter-options', authenticateToken, async (req: Request, res: Response) => {
  try {
    const filterOptions = await Workout.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: null,
          goals: { $addToSet: '$goal' },
          fitnessLevels: { $addToSet: '$fitnessLevel' },
          workoutTypes: { $addToSet: '$workoutType' },
          focusAreas: { $addToSet: { $arrayElemAt: ['$focusAreas', 0] } },
          planDurations: { $addToSet: '$planDuration' },
          allFocusAreas: { $push: '$focusAreas' }
        }
      },
      {
        $project: {
          _id: 0,
          goals: 1,
          fitnessLevels: 1,
          workoutTypes: 1,
          planDurations: 1,
          focusAreas: {
            $reduce: {
              input: '$allFocusAreas',
              initialValue: [],
              in: { $setUnion: ['$$value', '$$this'] }
            }
          }
        }
      }
    ]);

    const options = filterOptions[0] || {
      goals: [],
      fitnessLevels: [],
      workoutTypes: [],
      focusAreas: [],
      planDurations: []
    };

    res.json({
      success: true,
      data: {
        filterOptions: options
      }
    });

  } catch (error: any) {
    console.error('Get filter options error:', error);
    return sendErrorResponse(res, 500, 'Failed to fetch filter options');
  }
});

// Search workouts with suggestions
router.get('/search', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { q, limit = '5' } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: []
        }
      });
    }

    const limitNum = Math.min(parseInt(limit as string) || 5, 10);

    const suggestions = await Workout.find({
      isPublished: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { focusAreas: { $regex: q, $options: 'i' } }
      ]
    })
    .select('title goal fitnessLevel focusAreas')
    .limit(limitNum)
    .lean();

    res.json({
      success: true,
      data: {
        suggestions: suggestions.map(workout => ({
          id: workout._id,
          title: workout.title,
          goal: workout.goal,
          fitnessLevel: workout.fitnessLevel,
          focusAreas: workout.focusAreas
        }))
      }
    });

  } catch (error: any) {
    console.error('Search workouts error:', error);
    return sendErrorResponse(res, 500, 'Search failed');
  }
});

// Add to saved workouts (for future implementation)
router.post('/save/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    // Check if workout exists
    const workout = await Workout.findOne({ _id: id, isPublished: true });
    if (!workout) {
      return sendErrorResponse(res, 404, 'Workout not found');
    }

    // This would typically save to a UserSavedWorkouts collection
    // For now, just return success
    res.json({
      success: true,
      message: 'Workout saved successfully'
    });

  } catch (error: any) {
    console.error('Save workout error:', error);
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 400, 'Invalid workout ID');
    }
    
    return sendErrorResponse(res, 500, 'Failed to save workout');
  }
});

export default router;