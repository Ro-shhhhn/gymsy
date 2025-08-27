import mongoose from 'mongoose';
import { Workout } from '../models/Workout';

const sampleWorkouts = [
  // SIX PACK / ABS WORKOUTS
  {
    title: "Ultimate Six Pack Challenge",
    description: "Transform your core with this intensive 30-day program designed to build defined abs and strengthen your entire midsection. Perfect combination of targeted exercises and fat-burning circuits.",
    shortDescription: "30-day intensive core program for defined six-pack abs.",
    goal: "Muscle Gain",
    fitnessLevel: "Intermediate",
    duration: 35,
    focusAreas: ["Core", "Abs"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 280,
    planDuration: "4 weeks",
    category: "Challenge",
    subcategory: "Core Transformation",
    workoutStyle: "Circuit",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    exercises: [
      {
        name: "Bicycle Crunches",
        sets: 4,
        reps: 20,
        restTime: 30,
        targetMuscles: ["Abs", "Obliques"],
        equipment: []
      },
      {
        name: "Plank Hold",
        sets: 3,
        duration: 60,
        restTime: 45,
        targetMuscles: ["Core", "Abs"],
        equipment: []
      },
      {
        name: "Russian Twists",
        sets: 4,
        reps: 25,
        restTime: 30,
        targetMuscles: ["Obliques", "Core"],
        equipment: []
      },
      {
        name: "Dead Bug",
        sets: 3,
        reps: 12,
        restTime: 30,
        targetMuscles: ["Core", "Abs"],
        equipment: []
      }
    ],
    workoutsPerWeek: 5,
    tags: ["six pack", "abs", "core", "no equipment", "challenge"],
    seoKeywords: ["six pack workout", "abs challenge", "core training", "belly fat"],
    difficulty: 4,
    rating: 4.7,
    totalRatings: 142,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: true,
    isChallenge: true,
    isPremium: false
  },

  // CHEST BUILDING
  {
    title: "Powerful Chest Builder",
    description: "Build a strong, defined chest with this comprehensive workout targeting upper, middle, and lower pectoral muscles. Combines push-up variations and bodyweight exercises.",
    shortDescription: "Complete chest development program with push-up variations.",
    goal: "Muscle Gain",
    fitnessLevel: "Intermediate",
    duration: 40,
    focusAreas: ["Chest", "Arms", "Shoulders"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 320,
    planDuration: "6 weeks",
    category: "Strength",
    subcategory: "Upper Body Power",
    workoutStyle: "Traditional",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    exercises: [
      {
        name: "Standard Push-ups",
        sets: 4,
        reps: 15,
        restTime: 60,
        targetMuscles: ["Chest", "Shoulders", "Triceps"],
        equipment: []
      },
      {
        name: "Incline Push-ups",
        sets: 3,
        reps: 12,
        restTime: 45,
        targetMuscles: ["Upper Chest", "Shoulders"],
        equipment: []
      },
      {
        name: "Diamond Push-ups",
        sets: 3,
        reps: 8,
        restTime: 60,
        targetMuscles: ["Inner Chest", "Triceps"],
        equipment: []
      }
    ],
    workoutsPerWeek: 4,
    tags: ["chest", "push ups", "upper body", "strength", "muscle building"],
    seoKeywords: ["chest workout", "push up variations", "pectoral exercises"],
    difficulty: 3,
    rating: 4.5,
    totalRatings: 89,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: false,
    isChallenge: false,
    isPremium: false
  },

  // BICEPS & ARMS
  {
    title: "Massive Arms Blueprint",
    description: "Sculpt powerful biceps and triceps with this targeted arm workout. Build impressive arm strength and size using bodyweight and minimal equipment exercises.",
    shortDescription: "Targeted arm workout for bigger, stronger biceps and triceps.",
    goal: "Muscle Gain",
    fitnessLevel: "Beginner",
    duration: 30,
    focusAreas: ["Arms", "Biceps", "Triceps"],
    workoutType: "Dumbbells/Bands Only",
    caloriesBurnEstimate: 220,
    planDuration: "4 weeks",
    category: "Strength",
    subcategory: "Arm Specialization",
    workoutStyle: "Traditional",
    imageUrl: "https://images.unsplash.com/photo-1583500178690-f7fbed0ad0b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1583500178690-f7fbed0ad0b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    exercises: [
      {
        name: "Bicep Curls",
        sets: 4,
        reps: 12,
        restTime: 45,
        targetMuscles: ["Biceps"],
        equipment: ["Dumbbells"]
      },
      {
        name: "Tricep Dips",
        sets: 3,
        reps: 10,
        restTime: 60,
        targetMuscles: ["Triceps"],
        equipment: []
      },
      {
        name: "Hammer Curls",
        sets: 3,
        reps: 10,
        restTime: 45,
        targetMuscles: ["Biceps", "Forearms"],
        equipment: ["Dumbbells"]
      }
    ],
    workoutsPerWeek: 3,
    tags: ["arms", "biceps", "triceps", "dumbbells", "muscle building"],
    seoKeywords: ["bicep workout", "arm exercises", "tricep training"],
    difficulty: 2,
    rating: 4.3,
    totalRatings: 67,
    createdBy: "AI",
    isPublished: true,
    isFeatured: false,
    isChallenge: false,
    isPremium: false
  },

  // LEG DAY
  {
    title: "Thunder Thighs & Glute Power",
    description: "Build powerful legs and sculpted glutes with this comprehensive lower body workout. Targets quads, hamstrings, glutes, and calves for complete leg development.",
    shortDescription: "Complete lower body workout for powerful legs and glutes.",
    goal: "Muscle Gain",
    fitnessLevel: "Intermediate",
    duration: 45,
    focusAreas: ["Legs", "Glutes", "Quads", "Hamstrings"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 380,
    planDuration: "6 weeks",
    category: "Strength",
    subcategory: "Lower Body Power",
    workoutStyle: "Traditional",
    imageUrl: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    exercises: [
      {
        name: "Squats",
        sets: 4,
        reps: 15,
        restTime: 60,
        targetMuscles: ["Quads", "Glutes"],
        equipment: []
      },
      {
        name: "Bulgarian Split Squats",
        sets: 3,
        reps: 12,
        restTime: 45,
        targetMuscles: ["Quads", "Glutes"],
        equipment: []
      },
      {
        name: "Single Leg Deadlifts",
        sets: 3,
        reps: 10,
        restTime: 45,
        targetMuscles: ["Hamstrings", "Glutes"],
        equipment: []
      }
    ],
    workoutsPerWeek: 3,
    tags: ["legs", "glutes", "squats", "lower body", "strength"],
    seoKeywords: ["leg workout", "glute exercises", "quad training", "thigh workout"],
    difficulty: 4,
    rating: 4.6,
    totalRatings: 123,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: true,
    isChallenge: false,
    isPremium: false
  },

  // FAT LOSS / WEIGHT LOSS
  {
    title: "Fat Burning Furnace",
    description: "High-intensity fat burning workout designed to torch calories and boost metabolism. Perfect combination of cardio and strength exercises for maximum weight loss results.",
    shortDescription: "High-intensity fat burning and weight loss workout.",
    goal: "Fat Loss",
    fitnessLevel: "Intermediate",
    duration: 35,
    focusAreas: ["Full Body", "Cardio"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 450,
    planDuration: "4 weeks",
    category: "HIIT",
    subcategory: "Fat Loss Express",
    workoutStyle: "Circuit",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    exercises: [
      {
        name: "Burpees",
        sets: 4,
        reps: 12,
        restTime: 30,
        targetMuscles: ["Full Body", "Cardio"],
        equipment: []
      },
      {
        name: "Jump Squats",
        sets: 4,
        reps: 15,
        restTime: 30,
        targetMuscles: ["Legs", "Glutes", "Cardio"],
        equipment: []
      },
      {
        name: "Mountain Climbers",
        sets: 4,
        duration: 30,
        restTime: 30,
        targetMuscles: ["Core", "Cardio"],
        equipment: []
      }
    ],
    workoutsPerWeek: 5,
    tags: ["fat loss", "weight loss", "hiit", "cardio", "full body"],
    seoKeywords: ["fat burning workout", "weight loss exercise", "hiit training"],
    difficulty: 4,
    rating: 4.8,
    totalRatings: 201,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: true,
    isChallenge: false,
    isPremium: false
  },

  // BEGINNER FRIENDLY
  {
    title: "Beginner's Complete Body",
    description: "Perfect starting point for fitness beginners. This gentle yet effective workout introduces basic movements while building strength, endurance, and confidence.",
    shortDescription: "Perfect starting workout for complete fitness beginners.",
    goal: "General Fitness",
    fitnessLevel: "Beginner",
    duration: 25,
    focusAreas: ["Full Body"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 180,
    planDuration: "2 weeks",
    category: "Beginner",
    subcategory: "Getting Started",
    workoutStyle: "Traditional",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    exercises: [
      {
        name: "Wall Push-ups",
        sets: 2,
        reps: 8,
        restTime: 60,
        targetMuscles: ["Chest", "Arms"],
        equipment: []
      },
      {
        name: "Chair Squats",
        sets: 2,
        reps: 10,
        restTime: 60,
        targetMuscles: ["Legs", "Glutes"],
        equipment: []
      },
      {
        name: "Modified Plank",
        sets: 2,
        duration: 20,
        restTime: 60,
        targetMuscles: ["Core"],
        equipment: []
      }
    ],
    workoutsPerWeek: 3,
    tags: ["beginner", "easy", "full body", "no equipment", "starter"],
    seoKeywords: ["beginner workout", "easy exercises", "starter fitness"],
    difficulty: 1,
    rating: 4.4,
    totalRatings: 156,
    createdBy: "AI",
    isPublished: true,
    isFeatured: false,
    isChallenge: false,
    isPremium: false
  },

  // BACK & SHOULDERS
  {
    title: "V-Taper Back & Boulder Shoulders",
    description: "Create that coveted V-taper physique with this comprehensive back and shoulder workout. Build width, thickness, and strength in your upper body.",
    shortDescription: "Build a V-taper back and powerful boulder shoulders.",
    goal: "Muscle Gain",
    fitnessLevel: "Intermediate",
    duration: 42,
    focusAreas: ["Back", "Shoulders", "Upper Body"],
    workoutType: "Dumbbells/Bands Only",
    caloriesBurnEstimate: 310,
    planDuration: "6 weeks",
    category: "Strength",
    subcategory: "Upper Body Sculpting",
    workoutStyle: "Traditional",
    imageUrl: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    exercises: [
      {
        name: "Pike Push-ups",
        sets: 3,
        reps: 8,
        restTime: 60,
        targetMuscles: ["Shoulders"],
        equipment: []
      },
      {
        name: "Superman",
        sets: 3,
        reps: 12,
        restTime: 45,
        targetMuscles: ["Back"],
        equipment: []
      },
      {
        name: "Reverse Fly",
        sets: 3,
        reps: 12,
        restTime: 45,
        targetMuscles: ["Rear Delts", "Back"],
        equipment: ["Resistance Bands"]
      }
    ],
    workoutsPerWeek: 3,
    tags: ["back", "shoulders", "v-taper", "upper body", "posture"],
    seoKeywords: ["back workout", "shoulder exercises", "upper body training"],
    difficulty: 3,
    rating: 4.5,
    totalRatings: 78,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: false,
    isChallenge: false,
    isPremium: false
  },

  // CARDIO BLAST
  {
    title: "Cardio Inferno",
    description: "High-energy cardiovascular workout that will get your heart pumping and calories burning. Perfect for improving endurance and cardiovascular health.",
    shortDescription: "High-energy cardio workout for heart health and endurance.",
    goal: "Endurance",
    fitnessLevel: "Intermediate",
    duration: 30,
    focusAreas: ["Cardio", "Full Body"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 400,
    planDuration: "4 weeks",
    category: "Cardio",
    subcategory: "Endurance Booster",
    workoutStyle: "Circuit",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    exercises: [
      {
        name: "High Knees",
        sets: 4,
        duration: 30,
        restTime: 15,
        targetMuscles: ["Cardio", "Legs"],
        equipment: []
      },
      {
        name: "Jumping Jacks",
        sets: 4,
        duration: 30,
        restTime: 15,
        targetMuscles: ["Cardio", "Full Body"],
        equipment: []
      },
      {
        name: "Butt Kickers",
        sets: 4,
        duration: 30,
        restTime: 15,
        targetMuscles: ["Cardio", "Hamstrings"],
        equipment: []
      }
    ],
    workoutsPerWeek: 4,
    tags: ["cardio", "endurance", "heart health", "stamina", "conditioning"],
    seoKeywords: ["cardio workout", "endurance training", "heart health"],
    difficulty: 3,
    rating: 4.2,
    totalRatings: 91,
    createdBy: "AI",
    isPublished: true,
    isFeatured: false,
    isChallenge: false,
    isPremium: false
  },

  // FLEXIBILITY & MOBILITY
  {
    title: "Flexibility & Recovery Flow",
    description: "Improve flexibility, mobility, and recovery with this comprehensive stretching and yoga-inspired workout. Perfect for rest days or post-workout recovery.",
    shortDescription: "Improve flexibility and mobility with this recovery flow.",
    goal: "Flexibility",
    fitnessLevel: "Beginner",
    duration: 20,
    focusAreas: ["Full Body", "Hip Flexors"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 120,
    planDuration: "2 weeks",
    category: "Flexibility",
    subcategory: "Mobility & Recovery",
    workoutStyle: "Custom",
    imageUrl: "https://images.unsplash.com/photo-1506629905607-5359b84a8bbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1506629905607-5359b84a8bbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    exercises: [
      {
        name: "Cat-Cow Stretch",
        sets: 2,
        reps: 10,
        restTime: 30,
        targetMuscles: ["Back", "Core"],
        equipment: []
      },
      {
        name: "Hip Flexor Stretch",
        sets: 2,
        duration: 30,
        restTime: 30,
        targetMuscles: ["Hip Flexors"],
        equipment: []
      },
      {
        name: "Downward Dog",
        sets: 2,
        duration: 30,
        restTime: 30,
        targetMuscles: ["Full Body"],
        equipment: []
      }
    ],
    workoutsPerWeek: 6,
    tags: ["flexibility", "stretching", "mobility", "recovery", "yoga"],
    seoKeywords: ["flexibility workout", "stretching routine", "mobility exercises"],
    difficulty: 1,
    rating: 4.6,
    totalRatings: 134,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: false,
    isChallenge: false,
    isPremium: false
  },

  // QUICK 15-MINUTE WORKOUTS
  {
    title: "Express Full Body Blast",
    description: "Maximum results in minimum time! This efficient 15-minute workout targets all major muscle groups for busy schedules.",
    shortDescription: "Quick 15-minute full body workout for busy schedules.",
    goal: "General Fitness",
    fitnessLevel: "Intermediate",
    duration: 15,
    focusAreas: ["Full Body"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 200,
    planDuration: "4 weeks",
    category: "Quick",
    subcategory: "Time Efficient",
    workoutStyle: "Tabata",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    exercises: [
      {
        name: "Push-ups",
        sets: 3,
        reps: 10,
        restTime: 20,
        targetMuscles: ["Chest", "Arms"],
        equipment: []
      },
      {
        name: "Squats",
        sets: 3,
        reps: 12,
        restTime: 20,
        targetMuscles: ["Legs", "Glutes"],
        equipment: []
      },
      {
        name: "Plank",
        sets: 3,
        duration: 30,
        restTime: 20,
        targetMuscles: ["Core"],
        equipment: []
      }
    ],
    workoutsPerWeek: 6,
    tags: ["quick", "15 minute", "full body", "efficient", "tabata"],
    seoKeywords: ["quick workout", "15 minute exercise", "busy schedule fitness"],
    difficulty: 2,
    rating: 4.4,
    totalRatings: 167,
    createdBy: "AI",
    isPublished: true,
    isFeatured: false,
    isChallenge: false,
    isPremium: false
  },

  // ADVANCED CHALLENGE
  {
    title: "Elite Warrior Challenge",
    description: "The ultimate test for advanced fitness enthusiasts. This intense workout pushes your limits with complex movements and high-intensity challenges.",
    shortDescription: "Ultimate advanced fitness challenge for elite athletes.",
    goal: "Strength",
    fitnessLevel: "Advanced",
    duration: 60,
    focusAreas: ["Full Body", "Core", "Cardio"],
    workoutType: "No Equipment",
    caloriesBurnEstimate: 550,
    planDuration: "8+ weeks",
    category: "Challenge",
    subcategory: "Elite Performance",
    workoutStyle: "AMRAP",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    exercises: [
      {
        name: "Burpee to Tuck Jump",
        sets: 5,
        reps: 8,
        restTime: 90,
        targetMuscles: ["Full Body"],
        equipment: []
      },
      {
        name: "Single Arm Push-ups",
        sets: 4,
        reps: 5,
        restTime: 120,
        targetMuscles: ["Chest", "Core", "Arms"],
        equipment: []
      },
      {
        name: "Pistol Squats",
        sets: 4,
        reps: 6,
        restTime: 90,
        targetMuscles: ["Legs", "Core"],
        equipment: []
      }
    ],
    workoutsPerWeek: 3,
    tags: ["advanced", "elite", "challenge", "warrior", "intense"],
    seoKeywords: ["advanced workout", "elite fitness", "warrior training"],
    difficulty: 5,
    rating: 4.9,
    totalRatings: 87,
    createdBy: "Professional",
    isPublished: true,
    isFeatured: true,
    isChallenge: true,
    isPremium: true
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
    console.log(`✅ Inserted ${insertedWorkouts.length} enhanced workouts`);
    
    // Enhanced Analytics
    const categoryStats = await Workout.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          avgDifficulty: { $avg: '$difficulty' },
          avgCalories: { $avg: '$caloriesBurnEstimate' },
          fitnessLevels: { $addToSet: '$fitnessLevel' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('📊 Category Breakdown:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} workouts | ${Math.round(stat.avgDuration)}min avg | Difficulty: ${stat.avgDifficulty.toFixed(1)} | ${Math.round(stat.avgCalories)} cal avg`);
    });
    
    const goalStats = await Workout.aggregate([
      {
        $group: {
          _id: '$goal',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('🎯 Fitness Goals Distribution:');
    goalStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} workouts (★${stat.avgRating.toFixed(1)} avg rating)`);
    });
    
    const focusStats = await Workout.aggregate([
      { $unwind: '$focusAreas' },
      {
        $group: {
          _id: '$focusAreas',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    console.log('💪 Top Focus Areas:');
    focusStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} workouts`);
    });
    
    const difficultyStats = await Workout.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('⚡ Difficulty Levels:');
    const difficultyLabels = ['', 'Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'];
    difficultyStats.forEach(stat => {
      console.log(`   Level ${stat._id} (${difficultyLabels[stat._id]}): ${stat.count} workouts | ${Math.round(stat.avgDuration)}min avg`);
    });
    
    console.log(`🔥 Featured Workouts: ${await Workout.countDocuments({ isFeatured: true })}`);
    console.log(`🏆 Challenge Workouts: ${await Workout.countDocuments({ isChallenge: true })}`);
    console.log(`💎 Premium Workouts: ${await Workout.countDocuments({ isPremium: true })}`);
    
    console.log('🎉 Enhanced workout seeder completed successfully!');
    console.log('📱 Your workout cards will now display:');
    console.log('   ✅ Proper workout images from Unsplash');
    console.log('   ✅ Diverse fitness goals (Six Pack, Chest, Arms, Legs, etc.)');
    console.log('   ✅ All fitness levels (Beginner to Advanced)');
    console.log('   ✅ Various workout types and durations');
    console.log('   ✅ Proper difficulty ratings and calorie estimates');
    console.log('   ✅ Featured and challenge workouts');
    
    return insertedWorkouts;
    
  } catch (error) {
    console.error('❌ Error seeding workouts:', error);
    throw error;
  }
};

// Standalone execution
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