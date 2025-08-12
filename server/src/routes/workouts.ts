// server/src/routes/workouts.ts - Enhanced with Progress Tracking
import express, { Request, Response } from 'express';
import { query, body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Workout } from '../models/Workout';
import { UserWorkoutProgress } from '../models/UserWorkoutProgress';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Interface for JWT payload (should match your auth middleware)
interface JWTPayload {
  userId: string;
  email: string;
  isVerified: boolean;
  iat: number;
  exp: number;
}

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

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

// Get all published workouts with filtering and pagination
router.get('/premade', authenticateToken, workoutQueryValidation, async (req: AuthenticatedRequest, res: Response) => {
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
    } = req.query as any;

    // Build query
    const query: any = { isPublished: true };

    // Add filters
    if (goal) query.goal = goal;
    if (fitnessLevel) query.fitnessLevel = fitnessLevel;
    if (workoutType) query.workoutType = workoutType;
    if (planDuration) query.planDuration = planDuration;
    if (featured === 'true') query.isFeatured = true;

    // Focus areas filter
    if (focusAreas) {
      const areas = Array.isArray(focusAreas) ? focusAreas : focusAreas.split(',');
      query.focusAreas = { $in: areas };
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
    if (sortBy === 'rating') {
      sort.totalRatings = -1;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [workouts, totalCount] = await Promise.all([
      Workout.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('-exercises.instructions -__v')
        .lean(),
      Workout.countDocuments(query)
    ]);

    // Get user's progress for these workouts
    const userId = req.user?.userId;
    let userProgressMap: Map<string, any> = new Map();
    
    if (userId && workouts.length > 0) {
      const workoutIds = workouts.map(w => w._id);
      const userProgress = await UserWorkoutProgress.find({
        userId: new mongoose.Types.ObjectId(userId),
        workoutId: { $in: workoutIds }
      }).select('workoutId isStarted isCompleted isBookmarked completionPercentage currentWeek currentDay').lean();
      
      userProgress.forEach(progress => {
        userProgressMap.set(progress.workoutId.toString(), progress);
      });
    }

    // Enhance workouts with user progress
    const workoutsWithProgress = workouts.map((workout: any) => {
      const progress = userProgressMap.get(workout._id.toString());
      return {
        ...workout,
        averageRating: workout.totalRatings > 0 ? Math.round((workout.rating / workout.totalRatings) * 10) / 10 : 0,
        totalExercises: workout.exercises?.length || 0,
        userProgress: progress ? {
          isStarted: progress.isStarted,
          isCompleted: progress.isCompleted,
          isBookmarked: progress.isBookmarked,
          completionPercentage: progress.completionPercentage,
          currentWeek: progress.currentWeek,
          currentDay: progress.currentDay
        } : null
      };
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        workouts: workoutsWithProgress,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        filters: {
          goal, fitnessLevel, workoutType, focusAreas,
          planDuration, minDuration, maxDuration, search, featured
        }
      }
    });

  } catch (error: any) {
    console.error('Get workouts error:', error);
    return sendErrorResponse(res, 500, 'Failed to fetch workouts');
  }
});

// Get single workout by ID with complete details and user progress
router.get('/premade/:id', authenticateToken, param('id').isMongoId(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Invalid workout ID', formatValidationErrors(errors.array()));
    }

    const { id } = req.params;
    const userId = req.user?.userId;

    // Find workout by ID
    const workout = await Workout.findById(id).lean();

    if (!workout || !workout.isPublished) {
      return sendErrorResponse(res, 404, 'Workout plan not found');
    }

    // Get user's progress for this workout
    let userProgress = null;
    if (userId) {
      userProgress = await UserWorkoutProgress.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        workoutId: new mongoose.Types.ObjectId(id)
      }).lean();

      // Create progress entry if it doesn't exist
      if (!userProgress) {
        const totalWeeks = parseInt(workout.planDuration.split(' ')[0]) || 4;
        userProgress = new UserWorkoutProgress({
          userId: new mongoose.Types.ObjectId(userId),
          workoutId: new mongoose.Types.ObjectId(id),
          totalWeeks,
          totalDaysPerWeek: workout.workoutsPerWeek,
          currentWeek: 1,
          currentDay: 1
        });
        await userProgress.save();
        userProgress = userProgress.toObject();
      }
    }

    // Transform workout data
    const workoutData = {
      ...workout,
      averageRating: workout.totalRatings > 0 ? Math.round((workout.rating / workout.totalRatings) * 10) / 10 : 0,
      totalExercises: workout.exercises?.length || 0,
      estimatedCompletionTime: (() => {
        const exerciseTime = workout.exercises?.reduce((total: number, exercise: any) => {
          const exerciseDuration = exercise.duration || (exercise.reps ? exercise.reps * 3 : 0);
          return total + (exerciseDuration * exercise.sets) + (exercise.restTime * (exercise.sets - 1));
        }, 0) || 0;
        return Math.ceil(exerciseTime / 60);
      })(),
      userProgress: userProgress ? {
        isStarted: userProgress.isStarted,
        isCompleted: userProgress.isCompleted,
        isBookmarked: userProgress.isBookmarked,
        completionPercentage: userProgress.completionPercentage || 0,
        currentWeek: userProgress.currentWeek,
        currentDay: userProgress.currentDay,
        totalCompletedDays: userProgress.totalCompletedDays,
        consecutiveDays: userProgress.consecutiveDays,
        currentStreak: userProgress.currentStreak,
        completedDays: userProgress.completedDays || [],
        completedWeeks: userProgress.completedWeeks || [],
        lastWorkoutDate: userProgress.lastWorkoutDate,
        totalTimeSpent: userProgress.totalTimeSpent || 0,
        totalCaloriesBurned: userProgress.totalCaloriesBurned || 0
      } : null
    };

    res.json({
      success: true,
      message: 'Workout details retrieved successfully',
      data: {
        workout: workoutData
      }
    });

  } catch (error: any) {
    console.error('Get workout details error:', error);
    return sendErrorResponse(res, 500, 'Failed to retrieve workout details');
  }
});

// Get related workout plans
router.get('/premade/:id/related', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 6;
    const userId = req.user?.userId;

    const currentWorkout = await Workout.findById(id);
    if (!currentWorkout) {
      return sendErrorResponse(res, 404, 'Workout not found');
    }

    // Find related workouts
    const relatedWorkouts = await Workout.find({
      _id: { $ne: id },
      isPublished: true,
      $or: [
        { goal: currentWorkout.goal },
        { fitnessLevel: currentWorkout.fitnessLevel },
        { workoutType: currentWorkout.workoutType },
        { focusAreas: { $in: currentWorkout.focusAreas } },
        { category: currentWorkout.category }
      ]
    })
    .sort({ rating: -1, totalRatings: -1 })
    .limit(limit)
    .select('title shortDescription goal fitnessLevel duration workoutType caloriesBurnEstimate planDuration imageUrl thumbnailUrl rating totalRatings isFeatured')
    .lean();

    // Get user progress for related workouts
    let userProgressMap: Map<string, any> = new Map();
    if (userId && relatedWorkouts.length > 0) {
      const workoutIds = relatedWorkouts.map(w => w._id);
      const userProgress = await UserWorkoutProgress.find({
        userId: new mongoose.Types.ObjectId(userId),
        workoutId: { $in: workoutIds }
      }).select('workoutId isStarted isCompleted isBookmarked').lean();
      
      userProgress.forEach(progress => {
        userProgressMap.set(progress.workoutId.toString(), progress);
      });
    }

    // Enhance related workouts
    const relatedWorkoutsWithProgress = relatedWorkouts.map((workout: any) => {
      const progress = userProgressMap.get(workout._id.toString());
      return {
        ...workout,
        averageRating: workout.totalRatings > 0 ? Math.round((workout.rating / workout.totalRatings) * 10) / 10 : 0,
        userProgress: progress ? {
          isStarted: progress.isStarted,
          isCompleted: progress.isCompleted,
          isBookmarked: progress.isBookmarked
        } : null
      };
    });

    res.json({
      success: true,
      message: 'Related workouts retrieved successfully',
      data: {
        relatedWorkouts: relatedWorkoutsWithProgress,
        count: relatedWorkoutsWithProgress.length
      }
    });

  } catch (error: any) {
    console.error('Get related workouts error:', error);
    return sendErrorResponse(res, 500, 'Failed to retrieve related workouts');
  }
});

// POST bookmark/save workout plan
router.post('/premade/:id/bookmark', authenticateToken, param('id').isMongoId(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Invalid workout ID', formatValidationErrors(errors.array()));
    }

    const { id } = req.params;
    const userId = req.user?.userId!;

    // Validate workout exists
    const workout = await Workout.findById(id);
    if (!workout || !workout.isPublished) {
      return sendErrorResponse(res, 404, 'Workout not found');
    }

    // Find or create user progress
    let userProgress = await UserWorkoutProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      workoutId: new mongoose.Types.ObjectId(id)
    });

    if (!userProgress) {
      const totalWeeks = parseInt(workout.planDuration.split(' ')[0]) || 4;
      userProgress = new UserWorkoutProgress({
        userId: new mongoose.Types.ObjectId(userId),
        workoutId: new mongoose.Types.ObjectId(id),
        totalWeeks,
        totalDaysPerWeek: workout.workoutsPerWeek,
        currentWeek: 1,
        currentDay: 1
      });
    }

    // Toggle bookmark
    userProgress.isBookmarked = true;
    userProgress.bookmarkedAt = new Date();
    await userProgress.save();
    
    res.json({
      success: true,
      message: 'Workout bookmarked successfully',
      data: {
        workoutId: id,
        isBookmarked: true
      }
    });

  } catch (error: any) {
    console.error('Bookmark workout error:', error);
    return sendErrorResponse(res, 500, 'Failed to bookmark workout');
  }
});

// DELETE remove bookmark from workout plan
router.delete('/premade/:id/bookmark', authenticateToken, param('id').isMongoId(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Invalid workout ID', formatValidationErrors(errors.array()));
    }

    const { id } = req.params;
    const userId = req.user?.userId!;

    // Find user progress
    const userProgress = await UserWorkoutProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      workoutId: new mongoose.Types.ObjectId(id)
    });

    if (userProgress) {
      userProgress.isBookmarked = false;
      userProgress.bookmarkedAt = undefined;
      await userProgress.save();
    }
    
    res.json({
      success: true,
      message: 'Workout bookmark removed successfully',
      data: {
        workoutId: id,
        isBookmarked: false
      }
    });

  } catch (error: any) {
    console.error('Remove bookmark error:', error);
    return sendErrorResponse(res, 500, 'Failed to remove bookmark');
  }
});

// POST start workout session
router.post('/premade/:id/start', authenticateToken, param('id').isMongoId(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Invalid workout ID', formatValidationErrors(errors.array()));
    }

    const { id } = req.params;
    const userId = req.user?.userId!;

    // Validate workout exists
    const workout = await Workout.findById(id);
    if (!workout || !workout.isPublished) {
      return sendErrorResponse(res, 404, 'Workout not found');
    }

    // Find or create user progress
    let userProgress = await UserWorkoutProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      workoutId: new mongoose.Types.ObjectId(id)
    });

    if (!userProgress) {
      const totalWeeks = parseInt(workout.planDuration.split(' ')[0]) || 4;
      userProgress = new UserWorkoutProgress({
        userId: new mongoose.Types.ObjectId(userId),
        workoutId: new mongoose.Types.ObjectId(id),
        totalWeeks,
        totalDaysPerWeek: workout.workoutsPerWeek,
        currentWeek: 1,
        currentDay: 1
      });
    }

    // Mark as started and update last accessed
    if (!userProgress.isStarted) {
      userProgress.isStarted = true;
      userProgress.startedAt = new Date();
    }
    userProgress.lastAccessedAt = new Date();
    await userProgress.save();

    // Generate session ID
    const sessionId = new mongoose.Types.ObjectId().toString();
    
    res.json({
      success: true,
      message: 'Workout session started successfully',
      data: {
        sessionId: sessionId,
        workoutId: id,
        startedAt: new Date().toISOString(),
        currentWeek: userProgress.currentWeek,
        currentDay: userProgress.currentDay,
        workout: {
          title: workout.title,
          exercises: workout.exercises,
          duration: workout.duration,
          caloriesBurnEstimate: workout.caloriesBurnEstimate
        }
      }
    });

  } catch (error: any) {
    console.error('Start workout session error:', error);
    return sendErrorResponse(res, 500, 'Failed to start workout session');
  }
});

// POST complete workout day
router.post('/premade/:id/complete-day', 
  authenticateToken,
  param('id').isMongoId(),
  [
    body('week').isInt({ min: 1 }).withMessage('Week must be a positive integer'),
    body('day').isInt({ min: 1, max: 7 }).withMessage('Day must be between 1 and 7'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard'),
    body('caloriesBurned').optional().isInt({ min: 0 }).withMessage('Calories burned must be a non-negative integer'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be 500 characters or less'),
    body('sessionId').optional().isString().withMessage('Session ID must be a string')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, 'Invalid request data', formatValidationErrors(errors.array()));
      }

      const { id } = req.params;
      const { week, day, duration, difficulty, caloriesBurned, notes, sessionId } = req.body;
      const userId = req.user?.userId!;

      // Find user progress
      const userProgress = await UserWorkoutProgress.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        workoutId: new mongoose.Types.ObjectId(id)
      });

      if (!userProgress) {
        return sendErrorResponse(res, 404, 'Workout progress not found. Please start the workout first.');
      }

      try {
        await userProgress.completeDay(week, day, duration, difficulty, caloriesBurned, notes, sessionId);
        
        res.json({
          success: true,
          message: 'Workout day completed successfully',
          data: {
            workoutId: id,
            week,
            day,
            completionPercentage: userProgress.completionPercentage,
            currentStreak: userProgress.currentStreak,
            totalCompletedDays: userProgress.totalCompletedDays,
            isWorkoutCompleted: userProgress.isCompleted
          }
        });
      } catch (error: any) {
        return sendErrorResponse(res, 400, error.message);
      }

    } catch (error: any) {
      console.error('Complete workout day error:', error);
      return sendErrorResponse(res, 500, 'Failed to complete workout day');
    }
  }
);

// POST rate workout
router.post('/premade/:id/rate',
  authenticateToken,
  param('id').isMongoId(),
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review').optional().isLength({ max: 1000 }).withMessage('Review must be 1000 characters or less')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, 'Invalid request data', formatValidationErrors(errors.array()));
      }

      const { id } = req.params;
      const { rating, review } = req.body;
      const userId = req.user?.userId!;

      // Find user progress
      const userProgress = await UserWorkoutProgress.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        workoutId: new mongoose.Types.ObjectId(id)
      });

      if (!userProgress) {
        return sendErrorResponse(res, 404, 'You must start this workout before rating it');
      }

      // Rate the workout
      await userProgress.rateWorkout(rating, review);

      // Update workout's rating statistics
      const workout = await Workout.findById(id);
      if (workout) {
        // Recalculate workout rating based on all user ratings
        const allRatings = await UserWorkoutProgress.find({
          workoutId: new mongoose.Types.ObjectId(id),
          userRating: { $exists: true, $ne: null }
        }).select('userRating');

        if (allRatings.length > 0) {
          const totalRating = allRatings.reduce((sum, prog) => sum + (prog.userRating || 0), 0);
          workout.rating = totalRating;
          workout.totalRatings = allRatings.length;
          await workout.save();
        }
      }

      res.json({
        success: true,
        message: 'Workout rated successfully',
        data: {
          workoutId: id,
          rating,
          review
        }
      });

    } catch (error: any) {
      console.error('Rate workout error:', error);
      return sendErrorResponse(res, 500, 'Failed to rate workout');
    }
  }
);

// GET user's bookmarked workouts
router.get('/bookmarks', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get bookmarked workouts with workout details
    const bookmarkedWorkouts = await UserWorkoutProgress.find({
      userId: new mongoose.Types.ObjectId(userId),
      isBookmarked: true
    })
    .populate({
      path: 'workoutId',
      match: { isPublished: true },
      select: 'title shortDescription goal fitnessLevel duration workoutType caloriesBurnEstimate planDuration imageUrl thumbnailUrl rating totalRatings isFeatured'
    })
    .sort({ bookmarkedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Filter out any bookmarks where workout was not found or unpublished
    const validBookmarks = bookmarkedWorkouts
      .filter(bookmark => bookmark.workoutId)
      .map(bookmark => ({
        ...bookmark.workoutId,
        userProgress: {
          isStarted: bookmark.isStarted,
          isCompleted: bookmark.isCompleted,
          isBookmarked: bookmark.isBookmarked,
          completionPercentage: bookmark.completionPercentage,
          bookmarkedAt: bookmark.bookmarkedAt
        }
      }));

    const totalCount = await UserWorkoutProgress.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isBookmarked: true
    });

    res.json({
      success: true,
      message: 'Bookmarked workouts retrieved successfully',
      data: {
        bookmarkedWorkouts: validBookmarks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get bookmarks error:', error);
    return sendErrorResponse(res, 500, 'Failed to retrieve bookmarked workouts');
  }
});

// GET user's workout progress overview
router.get('/progress/overview', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;

    // Get user overview stats
    const overviewStats = await UserWorkoutProgress.getUserOverview(userId);
    const stats = overviewStats[0] || {
      totalWorkouts: 0,
      startedWorkouts: 0,
      completedWorkouts: 0,
      bookmarkedWorkouts: 0,
      totalTimeSpent: 0,
      totalCaloriesBurned: 0,
      totalCompletedDays: 0,
      averageRating: 0,
      longestStreak: 0
    };

    // Get recent workout activity
    const recentActivity = await UserWorkoutProgress.find({
      userId: new mongoose.Types.ObjectId(userId),
      isStarted: true
    })
    .populate({
      path: 'workoutId',
      select: 'title imageUrl thumbnailUrl'
    })
    .sort({ lastAccessedAt: -1 })
    .limit(5)
    .select('workoutId completionPercentage currentWeek currentDay lastAccessedAt isCompleted')
    .lean();

    res.json({
      success: true,
      message: 'User progress overview retrieved successfully',
      data: {
        stats,
        recentActivity: recentActivity.map(activity => ({
          workout: activity.workoutId,
          completionPercentage: activity.completionPercentage,
          currentWeek: activity.currentWeek,
          currentDay: activity.currentDay,
          lastAccessedAt: activity.lastAccessedAt,
          isCompleted: activity.isCompleted
        }))
      }
    });

  } catch (error: any) {
    console.error('Get progress overview error:', error);
    return sendErrorResponse(res, 500, 'Failed to retrieve progress overview');
  }
});

// GET user's progress for specific workout
router.get('/premade/:id/progress', authenticateToken, param('id').isMongoId(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Invalid workout ID', formatValidationErrors(errors.array()));
    }

    const { id } = req.params;
    const userId = req.user?.userId!;

    const userProgress = await UserWorkoutProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      workoutId: new mongoose.Types.ObjectId(id)
    }).lean();

    if (!userProgress) {
      return res.json({
        success: true,
        message: 'No progress found for this workout',
        data: {
          hasProgress: false
        }
      });
    }

    res.json({
      success: true,
      message: 'Workout progress retrieved successfully',
      data: {
        hasProgress: true,
        progress: {
          isStarted: userProgress.isStarted,
          isCompleted: userProgress.isCompleted,
          completionPercentage: userProgress.completionPercentage,
          currentWeek: userProgress.currentWeek,
          currentDay: userProgress.currentDay,
          totalCompletedDays: userProgress.totalCompletedDays,
          consecutiveDays: userProgress.consecutiveDays,
          currentStreak: userProgress.currentStreak,
          longestStreak: userProgress.longestStreak,
          totalTimeSpent: userProgress.totalTimeSpent,
          totalCaloriesBurned: userProgress.totalCaloriesBurned,
          completedDays: userProgress.completedDays,
          completedWeeks: userProgress.completedWeeks,
          isBookmarked: userProgress.isBookmarked,
          userRating: userProgress.userRating,
          userReview: userProgress.userReview,
          startedAt: userProgress.startedAt,
          completedAt: userProgress.completedAt,
          lastAccessedAt: userProgress.lastAccessedAt
        }
      }
    });

  } catch (error: any) {
    console.error('Get workout progress error:', error);
    return sendErrorResponse(res, 500, 'Failed to retrieve workout progress');
  }
});

// GET workout filter options
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
          planDurations: { $addToSet: '$planDuration' },
          categories: { $addToSet: '$category' },
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
          categories: 1,
          focusAreas: {
            $reduce: {
              input: '$allFocusAreas',
              initialValue: [],
              in: { $setUnion: ['$value', '$this'] }
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
      planDurations: [],
      categories: []
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

// GET search workouts with suggestions
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

export default router;