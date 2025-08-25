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