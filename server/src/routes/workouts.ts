// server/src/routes/workouts.ts - Refactored
import express, { Request, Response } from 'express';
import { query, body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Workout } from '../models/Workout';
import { UserWorkoutProgress } from '../models/UserWorkoutProgress';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

interface JWTPayload {
  userId: string;
  email: string;
  isVerified: boolean;
  iat: number;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Helper functions
const sendError = (res: Response, status: number, message: string, errors?: any[]) => 
  res.status(status).json({ success: false, message, errors });

const formatErrors = (errors: any[]) => 
  errors.map(e => ({ field: e.path || e.param, message: e.msg, value: e.value }));

const validateRequest = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 400, 'Validation failed', formatErrors(errors.array()));
    return false;
  }
  return true;
};

const getUserProgressMap = async (userId: string, workoutIds: any[]) => {
  if (!userId || !workoutIds.length) return new Map();
  
  const progress = await UserWorkoutProgress.find({
    userId: new mongoose.Types.ObjectId(userId),
    workoutId: { $in: workoutIds }
  }).select('workoutId isStarted isCompleted isBookmarked completionPercentage currentWeek currentDay').lean();
  
  const map = new Map();
  progress.forEach(p => map.set(p.workoutId.toString(), p));
  return map;
};

const enhanceWorkout = (workout: any, progress?: any) => ({
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
});

const findOrCreateProgress = async (userId: string, workoutId: string, workout?: any) => {
  let progress = await UserWorkoutProgress.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    workoutId: new mongoose.Types.ObjectId(workoutId)
  });

  if (!progress && workout) {
    const totalWeeks = parseInt(workout.planDuration.split(' ')[0]) || 4;
    progress = new UserWorkoutProgress({
      userId: new mongoose.Types.ObjectId(userId),
      workoutId: new mongoose.Types.ObjectId(workoutId),
      totalWeeks,
      totalDaysPerWeek: workout.workoutsPerWeek,
      currentWeek: 1,
      currentDay: 1
    });
    await progress.save();
  }
  return progress;
};

// Validations
const workoutQueryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('goal').optional().isIn(['Fat Loss', 'Muscle Gain', 'Strength', 'Endurance', 'Flexibility', 'General Fitness']),
  query('fitnessLevel').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  query('workoutType').optional().isIn(['Home', 'Gym', 'No Equipment', 'Dumbbells/Bands Only']),
  query('planDuration').optional().isIn(['2 weeks', '4 weeks', '6 weeks', '8+ weeks']),
  query('minDuration').optional().isInt({ min: 10 }),
  query('maxDuration').optional().isInt({ max: 120 }),
  query('sortBy').optional().isIn(['createdAt', 'rating', 'duration', 'title', 'difficulty']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
];

const completeWorkoutValidation = [
  param('id').isMongoId(),
  body('week').isInt({ min: 1 }),
  body('day').isInt({ min: 1, max: 7 }),
  body('duration').isInt({ min: 1 }),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']),
  body('caloriesBurned').optional().isInt({ min: 0 }),
  body('notes').optional().isLength({ max: 500 }),
  body('sessionId').optional().isString()
];

// Routes
router.get('/premade', authenticateToken, workoutQueryValidation, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!validateRequest(req, res)) return;

    const {
      page = '1', limit = '12', goal, fitnessLevel, workoutType, focusAreas,
      planDuration, minDuration, maxDuration, sortBy = 'createdAt',
      sortOrder = 'desc', search, featured
    } = req.query as any;

    // Build query
    const query: any = { isPublished: true };
    if (goal) query.goal = goal;
    if (fitnessLevel) query.fitnessLevel = fitnessLevel;
    if (workoutType) query.workoutType = workoutType;
    if (planDuration) query.planDuration = planDuration;
    if (featured === 'true') query.isFeatured = true;
    if (focusAreas) query.focusAreas = { $in: Array.isArray(focusAreas) ? focusAreas : focusAreas.split(',') };
    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration) query.duration.$gte = parseInt(minDuration);
      if (maxDuration) query.duration.$lte = parseInt(maxDuration);
    }
    if (search) query.$text = { $search: search };

    // Build sort
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    if (sortBy === 'rating') sort.totalRatings = -1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [workouts, totalCount] = await Promise.all([
      Workout.find(query).sort(sort).skip(skip).limit(limitNum)
        .select('-exercises.instructions -__v').lean(),
      Workout.countDocuments(query)
    ]);

    const progressMap = await getUserProgressMap(req.user?.userId!, workouts.map(w => w._id));
    const workoutsWithProgress = workouts.map(w => enhanceWorkout(w, progressMap.get(w._id.toString())));

    res.json({
      success: true,
      data: {
        workouts: workoutsWithProgress,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum,
          hasNext: pageNum < Math.ceil(totalCount / limitNum),
          hasPrev: pageNum > 1
        },
        filters: { goal, fitnessLevel, workoutType, focusAreas, planDuration, minDuration, maxDuration, search, featured }
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    sendError(res, 500, 'Failed to fetch workouts');
  }
});

router.get('/premade/:id', authenticateToken, param('id').isMongoId(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!validateRequest(req, res)) return;

    const { id } = req.params;
    const userId = req.user?.userId;

    const workout = await Workout.findById(id).lean();
    if (!workout || !workout.isPublished) {
      return sendError(res, 404, 'Workout plan not found');
    }

    let userProgress = null;
    if (userId) {
      userProgress = await findOrCreateProgress(userId, id, workout);
    }

    const workoutData = {
      ...workout,
      averageRating: workout.totalRatings > 0 ? Math.round((workout.rating / workout.totalRatings) * 10) / 10 : 0,
      totalExercises: workout.exercises?.length || 0,
      estimatedCompletionTime: Math.ceil((workout.exercises?.reduce((total: number, ex: any) => {
        const exerciseTime = ex.duration || (ex.reps ? ex.reps * 3 : 0);
        return total + (exerciseTime * ex.sets) + (ex.restTime * (ex.sets - 1));
      }, 0) || 0) / 60),
      userProgress: userProgress ? {
        ...userProgress.toObject(),
        totalTimeSpent: userProgress.totalTimeSpent || 0,
        totalCaloriesBurned: userProgress.totalCaloriesBurned || 0
      } : null
    };

    res.json({
      success: true,
      message: 'Workout details retrieved successfully',
      data: { workout: workoutData }
    });
  } catch (error) {
    console.error('Get workout details error:', error);
    sendError(res, 500, 'Failed to retrieve workout details');
  }
});

router.get('/premade/:id/related', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 6;

    const currentWorkout = await Workout.findById(id);
    if (!currentWorkout) return sendError(res, 404, 'Workout not found');

    const relatedWorkouts = await Workout.find({
      _id: { $ne: id },
      isPublished: true,
      $or: [
        { goal: currentWorkout.goal },
        { fitnessLevel: currentWorkout.fitnessLevel },
        { workoutType: currentWorkout.workoutType },
        { focusAreas: { $in: currentWorkout.focusAreas } }
      ]
    })
    .sort({ rating: -1, totalRatings: -1 }).limit(limit)
    .select('title shortDescription goal fitnessLevel duration workoutType caloriesBurnEstimate planDuration imageUrl rating totalRatings isFeatured')
    .lean();

    const progressMap = await getUserProgressMap(req.user?.userId!, relatedWorkouts.map(w => w._id));
    const workoutsWithProgress = relatedWorkouts.map(w => enhanceWorkout(w, progressMap.get(w._id.toString())));

    res.json({
      success: true,
      message: 'Related workouts retrieved successfully',
      data: { relatedWorkouts: workoutsWithProgress, count: workoutsWithProgress.length }
    });
  } catch (error) {
    console.error('Get related workouts error:', error);
    sendError(res, 500, 'Failed to retrieve related workouts');
  }
});

router.post('/premade/:id/bookmark', authenticateToken, param('id').isMongoId(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!validateRequest(req, res)) return;

    const { id } = req.params;
    const workout = await Workout.findById(id);
    if (!workout?.isPublished) return sendError(res, 404, 'Workout not found');

    const userProgress = await findOrCreateProgress(req.user!.userId, id, workout);
    userProgress!.isBookmarked = true;
    userProgress!.bookmarkedAt = new Date();
    await userProgress!.save();

    res.json({
      success: true,
      message: 'Workout bookmarked successfully',
      data: { workoutId: id, isBookmarked: true }
    });
  } catch (error) {
    console.error('Bookmark workout error:', error);
    sendError(res, 500, 'Failed to bookmark workout');
  }
});

router.delete('/premade/:id/bookmark', authenticateToken, param('id').isMongoId(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!validateRequest(req, res)) return;

    const { id } = req.params;
    const userProgress = await UserWorkoutProgress.findOne({
      userId: new mongoose.Types.ObjectId(req.user!.userId),
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
      data: { workoutId: id, isBookmarked: false }
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    sendError(res, 500, 'Failed to remove bookmark');
  }
});

router.post('/premade/:id/start', authenticateToken, param('id').isMongoId(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!validateRequest(req, res)) return;

    const { id } = req.params;
    const workout = await Workout.findById(id);
    if (!workout?.isPublished) return sendError(res, 404, 'Workout not found');

    const userProgress = await findOrCreateProgress(req.user!.userId, id, workout);
    if (!userProgress!.isStarted) {
      userProgress!.isStarted = true;
      userProgress!.startedAt = new Date();
    }
    userProgress!.lastAccessedAt = new Date();
    await userProgress!.save();

    res.json({
      success: true,
      message: 'Workout session started successfully',
      data: {
        sessionId: new mongoose.Types.ObjectId().toString(),
        workoutId: id,
        startedAt: new Date().toISOString(),
        currentWeek: userProgress!.currentWeek,
        currentDay: userProgress!.currentDay,
        workout: {
          title: workout.title,
          exercises: workout.exercises,
          duration: workout.duration,
          caloriesBurnEstimate: workout.caloriesBurnEstimate
        }
      }
    });
  } catch (error) {
    console.error('Start workout session error:', error);
    sendError(res, 500, 'Failed to start workout session');
  }
});

router.post('/premade/:id/complete-day', authenticateToken, completeWorkoutValidation, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!validateRequest(req, res)) return;

    const { id } = req.params;
    const { week, day, duration, difficulty, caloriesBurned, notes, sessionId } = req.body;

    const userProgress = await UserWorkoutProgress.findOne({
      userId: new mongoose.Types.ObjectId(req.user!.userId),
      workoutId: new mongoose.Types.ObjectId(id)
    });

    if (!userProgress) {
      return sendError(res, 404, 'Workout progress not found. Please start the workout first.');
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
      return sendError(res, 400, error.message);
    }
  } catch (error) {
    console.error('Complete workout day error:', error);
    sendError(res, 500, 'Failed to complete workout day');
  }
});

router.post('/premade/:id/rate', authenticateToken, [
  param('id').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('review').optional().isLength({ max: 1000 })
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!validateRequest(req, res)) return;

    const { id } = req.params;
    const { rating, review } = req.body;

    const userProgress = await UserWorkoutProgress.findOne({
      userId: new mongoose.Types.ObjectId(req.user!.userId),
      workoutId: new mongoose.Types.ObjectId(id)
    });

    if (!userProgress) {
      return sendError(res, 404, 'You must start this workout before rating it');
    }

    await userProgress.rateWorkout(rating, review);

    // Update workout rating
    const allRatings = await UserWorkoutProgress.find({
      workoutId: new mongoose.Types.ObjectId(id),
      userRating: { $exists: true, $ne: null }
    }).select('userRating');

    if (allRatings.length > 0) {
      const totalRating = allRatings.reduce((sum, prog) => sum + (prog.userRating || 0), 0);
      await Workout.findByIdAndUpdate(id, {
        rating: totalRating,
        totalRatings: allRatings.length
      });
    }

    res.json({
      success: true,
      message: 'Workout rated successfully',
      data: { workoutId: id, rating, review }
    });
  } catch (error) {
    console.error('Rate workout error:', error);
    sendError(res, 500, 'Failed to rate workout');
  }
});

router.get('/bookmarks', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const bookmarkedWorkouts = await UserWorkoutProgress.find({
      userId: new mongoose.Types.ObjectId(req.user!.userId),
      isBookmarked: true
    })
    .populate({
      path: 'workoutId',
      match: { isPublished: true },
      select: 'title shortDescription goal fitnessLevel duration workoutType caloriesBurnEstimate planDuration imageUrl rating totalRatings isFeatured'
    })
    .sort({ bookmarkedAt: -1 }).skip(skip).limit(limit).lean();

    const validBookmarks = bookmarkedWorkouts
      .filter(b => b.workoutId)
      .map(b => ({
        ...b.workoutId,
        userProgress: {
          isStarted: b.isStarted,
          isCompleted: b.isCompleted,
          isBookmarked: b.isBookmarked,
          completionPercentage: b.completionPercentage,
          bookmarkedAt: b.bookmarkedAt
        }
      }));

    const totalCount = await UserWorkoutProgress.countDocuments({
      userId: new mongoose.Types.ObjectId(req.user!.userId),
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
  } catch (error) {
    console.error('Get bookmarks error:', error);
    sendError(res, 500, 'Failed to retrieve bookmarked workouts');
  }
});

router.get('/progress/overview', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const overviewStats = await UserWorkoutProgress.getUserOverview(req.user!.userId);
    const stats = overviewStats[0] || {
      totalWorkouts: 0, startedWorkouts: 0, completedWorkouts: 0, bookmarkedWorkouts: 0,
      totalTimeSpent: 0, totalCaloriesBurned: 0, totalCompletedDays: 0,
      averageRating: 0, longestStreak: 0
    };

    const recentActivity = await UserWorkoutProgress.find({
      userId: new mongoose.Types.ObjectId(req.user!.userId),
      isStarted: true
    })
    .populate({ path: 'workoutId', select: 'title imageUrl' })
    .sort({ lastAccessedAt: -1 }).limit(5)
    .select('workoutId completionPercentage currentWeek currentDay lastAccessedAt isCompleted').lean();

    res.json({
      success: true,
      message: 'User progress overview retrieved successfully',
      data: {
        stats,
        recentActivity: recentActivity.map(a => ({
          workout: a.workoutId,
          completionPercentage: a.completionPercentage,
          currentWeek: a.currentWeek,
          currentDay: a.currentDay,
          lastAccessedAt: a.lastAccessedAt,
          isCompleted: a.isCompleted
        }))
      }
    });
  } catch (error) {
    console.error('Get progress overview error:', error);
    sendError(res, 500, 'Failed to retrieve progress overview');
  }
});

router.get('/premade/:id/progress', authenticateToken, param('id').isMongoId(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!validateRequest(req, res)) return;

    const userProgress = await UserWorkoutProgress.findOne({
      userId: new mongoose.Types.ObjectId(req.user!.userId),
      workoutId: new mongoose.Types.ObjectId(req.params.id)
    }).lean();

    if (!userProgress) {
      return res.json({
        success: true,
        message: 'No progress found for this workout',
        data: { hasProgress: false }
      });
    }

    res.json({
      success: true,
      message: 'Workout progress retrieved successfully',
      data: {
        hasProgress: true,
        progress: userProgress
      }
    });
  } catch (error) {
    console.error('Get workout progress error:', error);
    sendError(res, 500, 'Failed to retrieve workout progress');
  }
});

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
          goals: 1, fitnessLevels: 1, workoutTypes: 1, planDurations: 1, categories: 1,
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
      goals: [], fitnessLevels: [], workoutTypes: [], focusAreas: [], planDurations: [], categories: []
    };

    res.json({ success: true, data: { filterOptions: options } });
  } catch (error) {
    console.error('Get filter options error:', error);
    sendError(res, 500, 'Failed to fetch filter options');
  }
});

router.get('/search', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { q, limit = '5' } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json({ success: true, data: { suggestions: [] } });
    }

    const suggestions = await Workout.find({
      isPublished: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { focusAreas: { $regex: q, $options: 'i' } }
      ]
    })
    .select('title goal fitnessLevel focusAreas')
    .limit(Math.min(parseInt(limit as string) || 5, 10))
    .lean();

    res.json({
      success: true,
      data: {
        suggestions: suggestions.map(w => ({
          id: w._id, title: w.title, goal: w.goal, fitnessLevel: w.fitnessLevel, focusAreas: w.focusAreas
        }))
      }
    });
  } catch (error) {
    console.error('Search workouts error:', error);
    sendError(res, 500, 'Search failed');
  }
});

export default router;