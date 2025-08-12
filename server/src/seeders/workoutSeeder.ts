import mongoose from 'mongoose';
import { Workout } from '../models/Workout';

const sampleWorkouts = [
  {
    title: "30-Day Transformation Challenge",
    description: "Complete body transformation program combining strength, cardio, and flexibility training for maximum results.",
    shortDescription: "Complete body transformation in 30 days with varied daily workouts.",
    goal: "General Fitness",
    fitnessLevel: "Intermediate",
    duration: 45,
    focusAreas: ["Full Body"],
    workoutType: "Home",
    caloriesBurnEstimate: 400,
    planDuration: "4 weeks",
    category: "Challenge",
    subcategory: "Full Body Transformation",
    workoutStyle: "Circuit",
    exercises: [
      {
        name: "Burpees",
        sets: 4,
        reps: 10,
        restTime: 45,
        instructions: "Jump down to plank, push-up, jump feet to hands, jump up with arms overhead.",
        targetMuscles: ["Full Body"],
        equipment: []
      },
      {
        name: "Mountain Climbers",
        sets: 3,
        duration: 45,
        restTime: 30,
        instructions: "In plank position, alternate driving knees toward chest rapidly.",
        targetMuscles: ["Core", "Cardio"],
        equipment: []
      },
      {
        name: "Jump Squats",
        sets: 4,
        reps: 15,
        restTime: 60,
        instructions: "Squat down then explode up into a jump, landing softly.",
        targetMuscles: ["Legs", "Glutes"],
        equipment: []
      }
    ],
    workoutsPerWeek: 6,
    tags: ["challenge", "transformation", "full body", "intermediate"],
    seoKeywords: ["30 day challenge", "body transformation", "home workout challenge"],
    difficulty: 4,
    rating: 4.8,
    totalRatings: 25,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: true,
    isChallenge: true
  },

  {
    title: "15-Minute HIIT Blast",
    description: "Quick but intense high-intensity interval training session designed to maximize fat burn in minimal time.",
    shortDescription: "Quick 15-minute HIIT session for maximum fat burn.",
    goal: "Fat Loss",
    fitnessLevel: "Intermediate",
    duration: 15,
    focusAreas: ["Full Body", "Cardio"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 200,
    planDuration: "4 weeks",
    category: "HIIT",
    workoutStyle: "Tabata",
    exercises: [
      {
        name: "High Knees",
        sets: 4,
        duration: 20,
        restTime: 10,
        instructions: "Run in place bringing knees up to waist level as fast as possible.",
        targetMuscles: ["Legs", "Core", "Cardio"],
        equipment: []
      },
      {
        name: "Push-up to T",
        sets: 4,
        duration: 20,
        restTime: 10,
        instructions: "Push-up, then rotate into side plank alternating sides.",
        targetMuscles: ["Chest", "Core", "Shoulders"],
        equipment: []
      },
      {
        name: "Jump Lunges",
        sets: 4,
        duration: 20,
        restTime: 10,
        instructions: "Alternate jumping between lunge positions.",
        targetMuscles: ["Legs", "Glutes"],
        equipment: []
      }
    ],
    workoutsPerWeek: 5,
    tags: ["hiit", "tabata", "fat loss", "quick", "cardio"],
    seoKeywords: ["15 minute hiit", "quick hiit workout", "tabata training"],
    difficulty: 3,
    rating: 4.4,
    totalRatings: 35,
    createdBy: "AI",
    isPublished: true,
    isFeatured: true
  },

  {
    title: "Abs for Beginners - Foundation Builder",
    description: "Gentle introduction to core training focusing on proper form and building foundational strength in your abdominal muscles.",
    shortDescription: "Beginner-friendly core workout to build abdominal strength.",
    goal: "Strength",
    fitnessLevel: "Beginner",
    duration: 20,
    focusAreas: ["Core", "Abs"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 120,
    planDuration: "4 weeks",
    category: "Beginner",
    subcategory: "Core Beginner",
    workoutStyle: "Traditional",
    exercises: [
      {
        name: "Dead Bug",
        sets: 3,
        reps: 8,
        restTime: 45,
        instructions: "Lie on back, arms up, knees at 90°. Lower opposite arm and leg slowly.",
        targetMuscles: ["Core", "Hip Flexors"],
        equipment: []
      },
      {
        name: "Modified Plank",
        sets: 3,
        duration: 30,
        restTime: 60,
        instructions: "Hold plank position on knees, keeping straight line from head to knees.",
        targetMuscles: ["Core", "Shoulders"],
        equipment: []
      },
      {
        name: "Glute Bridge",
        sets: 3,
        reps: 12,
        restTime: 45,
        instructions: "Lie on back, squeeze glutes to lift hips up, creating straight line.",
        targetMuscles: ["Glutes", "Core"],
        equipment: []
      }
    ],
    workoutsPerWeek: 3,
    tags: ["abs", "beginner", "core", "foundation", "no equipment"],
    seoKeywords: ["beginner abs workout", "core exercises for beginners", "ab workout at home"],
    difficulty: 1,
    rating: 3.8,
    totalRatings: 42,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: false
  },

  {
    title: "Arms Sculptor - Intermediate",
    description: "Targeted arm workout using bodyweight and resistance to build definition in biceps, triceps, and shoulders.",
    shortDescription: "Intermediate arm workout for building upper body strength and definition.",
    goal: "Muscle Gain",
    fitnessLevel: "Intermediate",
    duration: 35,
    focusAreas: ["Arms", "Shoulders"],
    workoutType: "Dumbbells/Bands Only",
    caloriesBurnEstimate: 250,
    planDuration: "6 weeks",
    category: "Strength",
    subcategory: "Arms Intermediate",
    workoutStyle: "Circuit",
    exercises: [
      {
        name: "Dumbbell Bicep Curls",
        sets: 4,
        reps: 12,
        restTime: 60,
        instructions: "Stand with dumbbells, curl up squeezing biceps, control the lowering.",
        targetMuscles: ["Biceps"],
        equipment: ["Dumbbells"]
      },
      {
        name: "Overhead Tricep Extension",
        sets: 4,
        reps: 10,
        restTime: 60,
        instructions: "Hold dumbbell overhead with both hands, lower behind head, extend back up.",
        targetMuscles: ["Triceps"],
        equipment: ["Dumbbells"]
      },
      {
        name: "Pike Push-ups",
        sets: 3,
        reps: 8,
        restTime: 90,
        instructions: "In downward dog position, lower head toward hands, push back up.",
        targetMuscles: ["Shoulders", "Triceps"],
        equipment: []
      }
    ],
    workoutsPerWeek: 3,
    tags: ["arms", "intermediate", "dumbbells", "muscle gain", "upper body"],
    seoKeywords: ["arm workout intermediate", "dumbbell arm exercises", "bicep tricep workout"],
    difficulty: 3,
    rating: 4.9,
    totalRatings: 28,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: false
  },

  {
    title: "Daily Keep Fit Routine",
    description: "Balanced daily routine combining light cardio, strength, and flexibility to maintain overall fitness and energy.",
    shortDescription: "Balanced daily routine for maintaining fitness and energy levels.",
    goal: "General Fitness",
    fitnessLevel: "Beginner",
    duration: 25,
    focusAreas: ["Full Body"],
    workoutType: "Home",
    caloriesBurnEstimate: 180,
    planDuration: "8+ weeks",
    category: "General",
    workoutStyle: "Traditional",
    exercises: [
      {
        name: "Marching in Place",
        sets: 2,
        duration: 60,
        restTime: 30,
        instructions: "March in place lifting knees high, pump arms naturally.",
        targetMuscles: ["Legs", "Cardio"],
        equipment: []
      },
      {
        name: "Wall Push-ups",
        sets: 2,
        reps: 10,
        restTime: 45,
        instructions: "Stand arm's length from wall, push against wall and return.",
        targetMuscles: ["Chest", "Arms"],
        equipment: []
      },
      {
        name: "Seated Spinal Twist",
        sets: 2,
        reps: 8,
        restTime: 30,
        instructions: "Sit cross-legged, twist gently to each side holding for 3 seconds.",
        targetMuscles: ["Core", "Spine"],
        equipment: []
      }
    ],
    workoutsPerWeek: 7,
    tags: ["keep fit", "daily", "beginner", "maintenance", "gentle"],
    seoKeywords: ["daily fitness routine", "keep fit workout", "maintenance exercise"],
    difficulty: 1,
    rating: 4.1,
    totalRatings: 15,
    createdBy: "AI",
    isPublished: true,
    isFeatured: false
  },

  {
    title: "Morning Flexibility Flow",
    description: "Gentle morning stretching routine to improve flexibility, reduce stiffness, and prepare your body for the day ahead.",
    shortDescription: "Gentle morning stretches to improve flexibility and reduce stiffness.",
    goal: "Flexibility",
    fitnessLevel: "Beginner",
    duration: 15,
    focusAreas: ["Full Body"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 60,
    planDuration: "4 weeks",
    category: "Flexibility",
    workoutStyle: "Traditional",
    exercises: [
      {
        name: "Cat-Cow Stretch",
        sets: 2,
        reps: 10,
        restTime: 15,
        instructions: "On hands and knees, alternate between arching and rounding spine slowly.",
        targetMuscles: ["Spine", "Core"],
        equipment: []
      },
      {
        name: "Standing Forward Fold",
        sets: 2,
        duration: 30,
        restTime: 30,
        instructions: "Stand and fold forward, let arms hang heavy, gentle sway if feels good.",
        targetMuscles: ["Hamstrings", "Back"],
        equipment: []
      },
      {
        name: "Shoulder Rolls",
        sets: 2,
        reps: 10,
        restTime: 15,
        instructions: "Roll shoulders backward in large, slow circles, then forward.",
        targetMuscles: ["Shoulders", "Neck"],
        equipment: []
      }
    ],
    workoutsPerWeek: 7,
    tags: ["flexibility", "stretching", "morning", "mobility", "gentle"],
    seoKeywords: ["morning stretching routine", "flexibility workout", "daily stretches"],
    difficulty: 1,
    rating: 2.9,
    totalRatings: 22,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: false
  },

  {
    title: "Fat Torcher Express",
    description: "High-energy fat burning workout combining cardio intervals with strength moves for maximum calorie burn and metabolic boost.",
    shortDescription: "High-energy fat burning workout for maximum calorie burn.",
    goal: "Fat Loss",
    fitnessLevel: "Intermediate",
    duration: 30,
    focusAreas: ["Full Body", "Cardio"],
    workoutType: "Home",
    caloriesBurnEstimate: 350,
    planDuration: "6 weeks",
    category: "Cardio",
    workoutStyle: "Circuit",
    exercises: [
      {
        name: "Jumping Jacks",
        sets: 4,
        duration: 30,
        restTime: 15,
        instructions: "Jump feet wide while raising arms overhead, return to start.",
        targetMuscles: ["Full Body", "Cardio"],
        equipment: []
      },
      {
        name: "Squat Thrusts",
        sets: 4,
        reps: 12,
        restTime: 30,
        instructions: "Squat down, place hands on floor, jump feet back to plank, return.",
        targetMuscles: ["Full Body"],
        equipment: []
      },
      {
        name: "Speed Skaters",
        sets: 4,
        duration: 30,
        restTime: 15,
        instructions: "Leap side to side like a speed skater, touching ground with fingertips.",
        targetMuscles: ["Legs", "Core", "Cardio"],
        equipment: []
      }
    ],
    workoutsPerWeek: 4,
    tags: ["fat loss", "cardio", "calorie burn", "metabolic", "express"],
    seoKeywords: ["fat burning workout", "fat loss exercise", "calorie burning workout"],
    difficulty: 3,
    rating: 4.5,
    totalRatings: 38,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: true
  },

  {
    title: "10-Minute Power Boost",
    description: "Quick but effective workout to boost energy and mood when you're short on time but need to move your body.",
    shortDescription: "Quick 10-minute energy boosting workout for busy days.",
    goal: "General Fitness",
    fitnessLevel: "Beginner",
    duration: 10,
    focusAreas: ["Full Body"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 80,
    planDuration: "4 weeks",
    category: "Quick",
    workoutStyle: "Circuit",
    exercises: [
      {
        name: "Arm Swings",
        sets: 2,
        reps: 10,
        restTime: 15,
        instructions: "Swing arms in large circles, forward and backward.",
        targetMuscles: ["Shoulders", "Arms"],
        equipment: []
      },
      {
        name: "Bodyweight Squats",
        sets: 2,
        reps: 8,
        restTime: 30,
        instructions: "Squat down keeping chest up, return to standing.",
        targetMuscles: ["Legs", "Glutes"],
        equipment: []
      },
      {
        name: "Standing Knee Lifts",
        sets: 2,
        duration: 30,
        restTime: 15,
        instructions: "Alternate lifting knees toward chest while standing.",
        targetMuscles: ["Core", "Hip Flexors"],
        equipment: []
      }
    ],
    workoutsPerWeek: 7,
    tags: ["quick", "10 minute", "energy", "beginner", "busy"],
    seoKeywords: ["10 minute workout", "quick exercise", "short workout routine"],
    difficulty: 1,
    rating: 3.7,
    totalRatings: 19,
    createdBy: "AI",
    isPublished: true,
    isFeatured: false
  },

  {
    title: "Bodyweight Strength Builder",
    description: "Progressive bodyweight strength training program designed to build functional strength using only your body weight.",
    shortDescription: "Build functional strength using progressive bodyweight exercises.",
    goal: "Strength",
    fitnessLevel: "Intermediate",
    duration: 40,
    focusAreas: ["Full Body"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 280,
    planDuration: "8+ weeks",
    category: "Strength",
    workoutStyle: "Traditional",
    exercises: [
      {
        name: "Standard Push-ups",
        sets: 4,
        reps: 10,
        restTime: 90,
        instructions: "Full push-up maintaining straight line from head to heels.",
        targetMuscles: ["Chest", "Arms", "Core"],
        equipment: []
      },
      {
        name: "Single-Leg Glute Bridge",
        sets: 3,
        reps: 8,
        restTime: 60,
        instructions: "Bridge up on one leg, hold for 2 seconds, lower slowly.",
        targetMuscles: ["Glutes", "Hamstrings"],
        equipment: []
      },
      {
        name: "Pike Walk-outs",
        sets: 3,
        reps: 6,
        restTime: 75,
        instructions: "From standing, walk hands out to plank, walk back to standing.",
        targetMuscles: ["Core", "Shoulders", "Hamstrings"],
        equipment: []
      }
    ],
    workoutsPerWeek: 3,
    tags: ["strength", "bodyweight", "functional", "progressive", "intermediate"],
    seoKeywords: ["bodyweight strength training", "no equipment strength workout", "functional fitness"],
    difficulty: 3,
    rating: 4.8,
    totalRatings: 31,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: false
  },

  {
    title: "Muscle Building Foundation",
    description: "Comprehensive muscle building program focusing on compound movements and progressive overload for lean muscle development.",
    shortDescription: "Foundation program for building lean muscle with compound movements.",
    goal: "Muscle Gain",
    fitnessLevel: "Intermediate",
    duration: 50,
    focusAreas: ["Upper Body", "Lower Body"],
    workoutType: "Gym",
    caloriesBurnEstimate: 320,
    planDuration: "8+ weeks",
    category: "Strength",
    workoutStyle: "Traditional",
    exercises: [
      {
        name: "Goblet Squats",
        sets: 4,
        reps: 12,
        restTime: 120,
        instructions: "Hold weight at chest, squat down keeping chest up, drive through heels.",
        targetMuscles: ["Legs", "Glutes", "Core"],
        equipment: ["Dumbbell"]
      },
      {
        name: "Dumbbell Rows",
        sets: 4,
        reps: 10,
        restTime: 90,
        instructions: "Hinge at hips, row dumbbell to hip, squeeze shoulder blade.",
        targetMuscles: ["Back", "Biceps"],
        equipment: ["Dumbbell", "Bench"]
      },
      {
        name: "Dumbbell Press",
        sets: 4,
        reps: 8,
        restTime: 120,
        instructions: "Press dumbbells from chest level to overhead, control the descent.",
        targetMuscles: ["Chest", "Shoulders", "Triceps"],
        equipment: ["Dumbbells", "Bench"]
      }
    ],
    workoutsPerWeek: 4,
    tags: ["muscle gain", "compound", "progressive", "gym", "hypertrophy"],
    seoKeywords: ["muscle building workout", "compound exercises", "strength training for muscle"],
    difficulty: 3,
    rating: 4.7,
    totalRatings: 27,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: true
  }
];

export const seedWorkouts = async () => {
  try {
    console.log('🌱 Starting enhanced workout seeder...');
    
    console.log('🧹 Dropping existing indexes...');
    try {
      await Workout.collection.dropIndexes();
      console.log('✅ Dropped existing indexes');
    } catch (error) {
      console.log('ℹ️ No indexes to drop or collection doesn\'t exist yet');
    }
    
    await Workout.deleteMany({});
    console.log('✅ Cleared existing workouts');
    
    const insertedWorkouts = await Workout.insertMany(sampleWorkouts);
    console.log(`✅ Inserted ${insertedWorkouts.length} categorized workouts`);
    
    const categoryStats = await Workout.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          fitnessLevels: { $addToSet: '$fitnessLevel' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('📊 Category Breakdown:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} workouts (avg ${Math.round(stat.avgDuration)} min)`);
    });
    
    const levelStats = await Workout.aggregate([
      {
        $group: {
          _id: '$fitnessLevel',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('📈 Fitness Level Distribution:');
    levelStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} workouts`);
    });
    
    const focusStats = await Workout.aggregate([
      { $unwind: '$focusAreas' },
      {
        $group: {
          _id: '$focusAreas',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('🎯 Focus Areas:');
    focusStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} workouts`);
    });
    
    console.log('🎉 Enhanced workout seeder completed successfully!');
    
    return insertedWorkouts;
    
  } catch (error) {
    console.error('❌ Error seeding workouts:', error);
    throw error;
  }
};

if (require.main === module) {
  const runSeeder = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gymsy');
      console.log('🔌 Connected to MongoDB');
      
      await seedWorkouts();
      
      await mongoose.connection.close();
      console.log('🔌 Disconnected from MongoDB');
      
      process.exit(0);
    } catch (error) {
      console.error('💥 Seeder failed:', error);
      process.exit(1);
    }
  };
  
  runSeeder();
}