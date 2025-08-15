// server/src/admin/controllers/adminWorkoutController.ts
import { Request, Response } from 'express';
import { Workout } from '../../models/Workout';
import type { IWorkout } from '../../models/Workout';

interface AdminRequest extends Request {
  admin?: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Get all workouts with admin filters
export const getAllWorkouts = async (req: AdminRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      goal,
      fitnessLevel,
      workoutType,
      category,
      isPublished,
      isFeatured,
      isChallenge,
      isPremium,
      createdBy,
      minDuration,
      maxDuration,
      difficultyMin,
      difficultyMax,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateRangeStart,
      dateRangeEnd
    } = req.query;

    // Build filter object
    const filter: any = {};

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // Specific filters
    if (goal) filter.goal = goal;
    if (fitnessLevel) filter.fitnessLevel = fitnessLevel;
    if (workoutType) filter.workoutType = workoutType;
    if (category) filter.category = category;
    if (createdBy) filter.createdBy = createdBy;

    // Boolean filters
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (isChallenge !== undefined) filter.isChallenge = isChallenge === 'true';
    if (isPremium !== undefined) filter.isPremium = isPremium === 'true';

    // Range filters
    if (minDuration || maxDuration) {
      filter.duration = {};
      if (minDuration) filter.duration.$gte = Number(minDuration);
      if (maxDuration) filter.duration.$lte = Number(maxDuration);
    }

    if (difficultyMin || difficultyMax) {
      filter.difficulty = {};
      if (difficultyMin) filter.difficulty.$gte = Number(difficultyMin);
      if (difficultyMax) filter.difficulty.$lte = Number(difficultyMax);
    }

    // Date range filter
    if (dateRangeStart || dateRangeEnd) {
      filter.createdAt = {};
      if (dateRangeStart) filter.createdAt.$gte = new Date(dateRangeStart as string);
      if (dateRangeEnd) filter.createdAt.$lte = new Date(dateRangeEnd as string);
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit))); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [workouts, totalCount] = await Promise.all([
      Workout.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Workout.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    res.json({
      success: true,
      message: 'Workouts retrieved successfully',
      data: {
        workouts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNext,
          hasPrev
        },
        filters: filter
      }
    });
  } catch (error: any) {
    console.error('Get all workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve workouts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single workout by ID
export const getWorkoutById = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID format'
      });
    }

    const workout = await Workout.findById(id).lean();

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout retrieved successfully',
      data: {
        workout
      }
    });
  } catch (error: any) {
    console.error('Get workout by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve workout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new workout
export const createWorkout = async (req: AdminRequest, res: Response) => {
  try {
    const workoutData = req.body;

    // Add creator information
    workoutData.createdBy = 'Admin';
    workoutData.creatorId = req.admin?._id;
    workoutData.lastModifiedBy = req.admin?._id;

    // Create new workout
    const workout = new Workout(workoutData);
    const savedWorkout = await workout.save();

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: {
        workout: savedWorkout
      }
    });
  } catch (error: any) {
    console.error('Create workout error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
        value: error.errors[key].value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create workout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update existing workout
export const updateWorkout = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID format'
      });
    }

    // Add modification tracking
    updateData.lastModifiedBy = req.admin?._id;
    updateData.updatedAt = new Date();

    const workout = await Workout.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        lean: true
      }
    );

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout updated successfully',
      data: {
        workout
      }
    });
  } catch (error: any) {
    console.error('Update workout error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
        value: error.errors[key].value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update workout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete workout
export const deleteWorkout = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID format'
      });
    }

    const workout = await Workout.findByIdAndDelete(id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout deleted successfully',
      data: {
        workoutId: id
      }
    });
  } catch (error: any) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete workout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Bulk delete workouts
export const bulkDeleteWorkouts = async (req: AdminRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout IDs provided'
      });
    }

    // Validate all IDs
    const invalidIds = ids.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some workout IDs are invalid',
        errors: [{ field: 'ids', message: `Invalid IDs: ${invalidIds.join(', ')}` }]
      });
    }

    const result = await Workout.deleteMany({ _id: { $in: ids } });

    const deletedIds = ids.slice(0, result.deletedCount);
    const failedIds = ids.slice(result.deletedCount);

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} workout(s)`,
      data: {
        deletedIds,
        failedIds,
        deletedCount: result.deletedCount
      }
    });
  } catch (error: any) {
    console.error('Bulk delete workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete workouts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Bulk update workouts
export const bulkUpdateWorkouts = async (req: AdminRequest, res: Response) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates provided'
      });
    }

    const results = [];
    const failedUpdates = [];

    for (const update of updates) {
      try {
        const { id, data } = update;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
          failedUpdates.push(id);
          continue;
        }

        data.lastModifiedBy = req.admin?._id;
        data.updatedAt = new Date();

        const updatedWorkout = await Workout.findByIdAndUpdate(
          id,
          data,
          { new: true, runValidators: true, lean: true }
        );

        if (updatedWorkout) {
          results.push(updatedWorkout);
        } else {
          failedUpdates.push(id);
        }
      } catch (error) {
        failedUpdates.push(update.id);
      }
    }

    res.json({
      success: true,
      message: `Successfully updated ${results.length} workout(s)`,
      data: {
        updatedWorkouts: results,
        failedUpdates
      }
    });
  } catch (error: any) {
    console.error('Bulk update workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update workouts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Toggle workout publish status
export const togglePublishWorkout = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID format'
      });
    }

    const workout = await Workout.findById(id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    workout.isPublished = !workout.isPublished;
    workout.lastModifiedBy = req.admin?._id;

    if (workout.isPublished && !workout.publishedAt) {
      workout.publishedAt = new Date();
    }

    const updatedWorkout = await workout.save();

    res.json({
      success: true,
      message: `Workout ${workout.isPublished ? 'published' : 'unpublished'} successfully`,
      data: {
        workout: updatedWorkout
      }
    });
  } catch (error: any) {
    console.error('Toggle publish workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle workout publish status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Toggle workout feature status
export const toggleFeatureWorkout = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID format'
      });
    }

    const workout = await Workout.findById(id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    workout.isFeatured = !workout.isFeatured;
    workout.lastModifiedBy = req.admin?._id;

    const updatedWorkout = await workout.save();

    res.json({
      success: true,
      message: `Workout ${workout.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: {
        workout: updatedWorkout
      }
    });
  } catch (error: any) {
    console.error('Toggle feature workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle workout feature status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Duplicate workout
export const duplicateWorkout = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID format'
      });
    }

    const originalWorkout = await Workout.findById(id).lean();

    if (!originalWorkout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Create duplicate workout data
    const duplicateData = {
      ...originalWorkout,
      _id: undefined,
      title: `${originalWorkout.title} (Copy)`,
      isPublished: false,
      isFeatured: false,
      publishedAt: undefined,
      createdBy: 'Admin' as const,
      creatorId: req.admin?._id,
      lastModifiedBy: req.admin?._id,
      rating: 0,
      totalRatings: 0,
      createdAt: undefined,
      updatedAt: undefined
    };

    const duplicatedWorkout = new Workout(duplicateData);
    const savedWorkout = await duplicatedWorkout.save();

    res.status(201).json({
      success: true,
      message: 'Workout duplicated successfully',
      data: {
        workout: savedWorkout
      }
    });
  } catch (error: any) {
    console.error('Duplicate workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate workout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get workout analytics
export const getWorkoutAnalytics = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID format'
      });
    }

    const workout = await Workout.findById(id).lean();

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // TODO: Implement actual analytics from UserWorkoutProgress collection
    // For now, return mock data structure
    const analytics = {
      totalUsers: workout.totalRatings || 0,
      completedUsers: Math.floor((workout.totalRatings || 0) * 0.7),
      averageRating: workout.totalRatings > 0 ? workout.rating / workout.totalRatings : 0,
      totalRatings: workout.totalRatings,
      completionRate: 70, // Mock data - should be calculated from actual progress data
      averageDuration: workout.duration,
      popularDays: ['Monday', 'Wednesday', 'Friday'], // Mock data
      userProgress: [] // Mock data - should come from UserWorkoutProgress collection
    };

    res.json({
      success: true,
      message: 'Workout analytics retrieved successfully',
      data: analytics
    });
  } catch (error: any) {
    console.error('Get workout analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve workout analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get workout statistics for admin dashboard
export const getWorkoutStats = async (req: AdminRequest, res: Response) => {
  try {
    const [
      totalWorkouts,
      publishedWorkouts,
      featuredWorkouts,
      draftWorkouts,
      avgRating
    ] = await Promise.all([
      Workout.countDocuments(),
      Workout.countDocuments({ isPublished: true }),
      Workout.countDocuments({ isFeatured: true }),
      Workout.countDocuments({ isPublished: false }),
      Workout.aggregate([
        { $match: { totalRatings: { $gt: 0 } } },
        { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
      ])
    ]);

    // Get top performing workouts
    const topWorkouts = await Workout.find({ isPublished: true })
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(5)
      .select('title averageRating totalRatings')
      .lean();

    // Get recent workouts
    const recentWorkouts = await Workout.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title createdAt isPublished createdBy')
      .lean();

    res.json({
      success: true,
      message: 'Workout statistics retrieved successfully',
      data: {
        totalWorkouts,
        publishedWorkouts,
        featuredWorkouts,
        draftWorkouts,
        averageRating: avgRating.length > 0 ? avgRating[0].avgRating : 0,
        topWorkouts,
        recentWorkouts
      }
    });
  } catch (error: any) {
    console.error('Get workout stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve workout statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get workout categories and filter options
export const getWorkoutFilterOptions = async (req: AdminRequest, res: Response) => {
  try {
    const [
      goals,
      fitnessLevels,
      workoutTypes,
      categories,
      focusAreas,
      planDurations,
      workoutStyles
    ] = await Promise.all([
      Workout.distinct('goal'),
      Workout.distinct('fitnessLevel'),
      Workout.distinct('workoutType'),
      Workout.distinct('category'),
      Workout.distinct('focusAreas'),
      Workout.distinct('planDuration'),
      Workout.distinct('workoutStyle')
    ]);

    res.json({
      success: true,
      message: 'Filter options retrieved successfully',
      data: {
        filterOptions: {
          goals: goals.sort(),
          fitnessLevels: fitnessLevels.sort(),
          workoutTypes: workoutTypes.sort(),
          categories: categories.sort(),
          focusAreas: focusAreas.flat().filter((item, index, array) => array.indexOf(item) === index).sort(),
          planDurations: planDurations.sort(),
          workoutStyles: workoutStyles.sort()
        }
      }
    });
  } catch (error: any) {
    console.error('Get workout filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve filter options',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search workouts (for admin search functionality)
export const searchWorkouts = async (req: AdminRequest, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const workouts = await Workout.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { focusAreas: { $in: [searchRegex] } }
      ]
    })
    .select('title goal fitnessLevel focusAreas isPublished createdAt')
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(limitNum)
    .lean();

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: {
        suggestions: workouts.map(workout => ({
          id: workout._id,
          title: workout.title,
          goal: workout.goal,
          fitnessLevel: workout.fitnessLevel,
          focusAreas: workout.focusAreas,
          isPublished: workout.isPublished
        })),
        totalCount: workouts.length
      }
    });
  } catch (error: any) {
    console.error('Search workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export workout data (for backup/export functionality)
export const exportWorkouts = async (req: AdminRequest, res: Response) => {
  try {
    const { format = 'json', includeUnpublished = false } = req.query;

    const filter: any = {};
    if (!includeUnpublished || includeUnpublished === 'false') {
      filter.isPublished = true;
    }

    const workouts = await Workout.find(filter).lean();

    if (format === 'csv') {
      // TODO: Implement CSV export
      res.status(501).json({
        success: false,
        message: 'CSV export not yet implemented'
      });
    } else {
      res.json({
        success: true,
        message: 'Workouts exported successfully',
        data: {
          workouts,
          exportedAt: new Date().toISOString(),
          totalCount: workouts.length
        }
      });
    }
  } catch (error: any) {
    console.error('Export workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export workouts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Import workouts (for bulk import functionality)
export const importWorkouts = async (req: AdminRequest, res: Response) => {
  try {
    const { workouts, replaceExisting = false } = req.body;

    if (!Array.isArray(workouts) || workouts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workouts data provided'
      });
    }

    const results = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const workoutData of workouts) {
      try {
        // Add admin metadata
        workoutData.createdBy = 'Admin';
        workoutData.creatorId = req.admin?._id;
        workoutData.lastModifiedBy = req.admin?._id;

        if (replaceExisting && workoutData._id) {
          // Update existing workout
          const updated = await Workout.findByIdAndUpdate(
            workoutData._id,
            workoutData,
            { new: true, runValidators: true, upsert: false }
          );
          if (updated) {
            results.updated++;
          } else {
            results.failed++;
            results.errors.push(`Workout with ID ${workoutData._id} not found for update`);
          }
        } else {
          // Create new workout
          delete workoutData._id; // Remove ID to create new
          const newWorkout = new Workout(workoutData);
          await newWorkout.save();
          results.imported++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Failed to import workout "${workoutData.title}": ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Import completed. ${results.imported} imported, ${results.updated} updated, ${results.failed} failed.`,
      data: results
    });
  } catch (error: any) {
    console.error('Import workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import workouts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};