// server/src/seeders/exerciseSeeder.ts
import mongoose from 'mongoose';
import { Exercise } from '../models/Exercise';

const sampleExercises = [
  // Core/Abs Exercises
  {
    name: "Bicycle Crunches",
    category: "Strength",
    primaryMuscles: ["Abs", "Obliques"],
    secondaryMuscles: ["Core"],
    equipment: ["None"],
    difficulty: 2,
    instructions: {
      setup: "Lie on your back with hands behind head, knees bent at 90 degrees",
      execution: [
        "Lift shoulders off ground and bring right elbow to left knee",
        "Extend right leg while rotating torso",
        "Switch sides, bringing left elbow to right knee",
        "Continue alternating in a pedaling motion"
      ],
      breathing: "Exhale when crunching, inhale when extending",
      commonMistakes: [
        "Pulling on neck with hands",
        "Moving too fast without control",
        "Not fully extending the legs"
      ]
    },
    mediaUrls: {
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    metrics: {
      avgCaloriesPerMinute: 6,
      avgHeartRateIncrease: 15
    },
    isCompound: false,
    isUnilateral: true,
    movementPattern: "Rotation",
    tags: ["abs", "core", "bodyweight", "beginner"]
  },

  {
    name: "Plank Hold",
    category: "Strength",
    primaryMuscles: ["Core", "Abs"],
    secondaryMuscles: ["Shoulders", "Back"],
    equipment: ["None"],
    difficulty: 2,
    instructions: {
      setup: "Start in push-up position, then lower to forearms",
      execution: [
        "Keep body in straight line from head to heels",
        "Engage core muscles throughout",
        "Hold position for specified time",
        "Breathe normally while maintaining form"
      ],
      breathing: "Breathe steadily, don't hold breath",
      commonMistakes: [
        "Sagging hips or raising them too high",
        "Looking up instead of keeping neutral neck",
        "Not engaging core muscles properly"
      ]
    },
    metrics: {
      avgCaloriesPerMinute: 4,
      avgHeartRateIncrease: 10
    },
    isCompound: true,
    isUnilateral: false,
    movementPattern: "Other",
    tags: ["plank", "core", "isometric", "stability"]
  },

  // Push Exercises
  {
    name: "Standard Push-ups",
    category: "Strength",
    primaryMuscles: ["Chest", "Shoulders", "Triceps"],
    secondaryMuscles: ["Core"],
    equipment: ["None"],
    difficulty: 3,
    instructions: {
      setup: "Start in high plank position, hands slightly wider than shoulders",
      execution: [
        "Lower body until chest nearly touches floor",
        "Keep body in straight line throughout movement",
        "Push back up to starting position",
        "Repeat for desired repetitions"
      ],
      breathing: "Inhale while lowering, exhale while pushing up",
      commonMistakes: [
        "Flaring elbows too wide",
        "Not going through full range of motion",
        "Sagging hips or pike position"
      ],
      modifications: {
        easier: ["Knee push-ups", "Wall push-ups", "Incline push-ups"],
        harder: ["Diamond push-ups", "Decline push-ups", "Single-arm push-ups"]
      }
    },
    metrics: {
      avgCaloriesPerMinute: 8,
      avgHeartRateIncrease: 20
    },
    isCompound: true,
    isUnilateral: false,
    movementPattern: "Push",
    tags: ["push-up", "chest", "bodyweight", "compound"]
  },

  // Leg Exercises
  {
    name: "Squats",
    category: "Strength",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core", "Calves"],
    equipment: ["None"],
    difficulty: 2,
    instructions: {
      setup: "Stand with feet shoulder-width apart, toes slightly turned out",
      execution: [
        "Initiate movement by pushing hips back",
        "Lower until thighs are parallel to floor",
        "Keep chest up and knees tracking over toes",
        "Drive through heels to return to standing"
      ],
      breathing: "Inhale while descending, exhale while standing up",
      commonMistakes: [
        "Knees caving inward",
        "Not reaching proper depth",
        "Leaning too far forward"
      ],
      modifications: {
        easier: ["Chair-assisted squats", "Partial range squats"],
        harder: ["Jump squats", "Single-leg squats", "Goblet squats"]
      }
    },
    metrics: {
      avgCaloriesPerMinute: 7,
      avgHeartRateIncrease: 18
    },
    isCompound: true,
    isUnilateral: false,
    movementPattern: "Squat",
    tags: ["squat", "legs", "glutes", "functional"]
  },

  // Cardio Exercises
  {
    name: "Burpees",
    category: "Cardio",
    primaryMuscles: ["Full Body", "Cardio"],
    secondaryMuscles: ["Chest", "Shoulders", "Quads", "Glutes"], // Fixed: Changed "Legs" to "Quads", "Glutes"
    equipment: ["None"],
    difficulty: 4,
    instructions: {
      setup: "Stand with feet shoulder-width apart",
      execution: [
        "Squat down and place hands on floor",
        "Jump feet back into plank position",
        "Perform a push-up (optional)",
        "Jump feet back to squat position",
        "Jump up with arms overhead"
      ],
      breathing: "Try to maintain steady breathing rhythm",
      commonMistakes: [
        "Not maintaining plank position",
        "Landing hard on feet",
        "Rushing through movements without control"
      ],
      modifications: {
        easier: ["Step back instead of jumping", "Remove push-up", "Remove jump at top"],
        harder: ["Add tuck jump", "Add push-up", "Increase tempo"]
      }
    },
    metrics: {
      avgCaloriesPerMinute: 12,
      avgHeartRateIncrease: 35
    },
    isCompound: true,
    isUnilateral: false,
    movementPattern: "Other",
    tags: ["burpee", "hiit", "cardio", "full-body"]
  },

  {
    name: "Jumping Jacks",
    category: "Cardio",
    primaryMuscles: ["Cardio", "Full Body"],
    secondaryMuscles: ["Shoulders", "Quads", "Calves"], // Fixed: Changed "Legs" to "Quads", "Calves"
    equipment: ["None"],
    difficulty: 1,
    instructions: {
      setup: "Stand upright with feet together, arms at sides",
      execution: [
        "Jump feet apart while raising arms overhead",
        "Jump feet back together while lowering arms",
        "Maintain steady rhythm throughout",
        "Land softly on balls of feet"
      ],
      breathing: "Breathe naturally, avoid holding breath",
      commonMistakes: [
        "Landing too hard on heels",
        "Moving arms out of sync with legs",
        "Going too fast and losing form"
      ]
    },
    metrics: {
      avgCaloriesPerMinute: 8,
      avgHeartRateIncrease: 25
    },
    isCompound: false,
    isUnilateral: false,
    movementPattern: "Other",
    tags: ["cardio", "warm-up", "coordination", "beginner"]
  },

  // Upper Body Exercises
  {
    name: "Tricep Dips",
    category: "Strength",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders", "Chest"],
    equipment: ["None"],
    difficulty: 3,
    instructions: {
      setup: "Sit on edge of chair/bench, hands gripping edge beside hips",
      execution: [
        "Walk feet forward and lower hips off edge",
        "Lower body by bending elbows to 90 degrees",
        "Keep elbows close to body",
        "Press back up to starting position"
      ],
      breathing: "Inhale while lowering, exhale while pressing up",
      commonMistakes: [
        "Flaring elbows out to sides",
        "Not going through full range of motion",
        "Using legs too much for assistance"
      ]
    },
    metrics: {
      avgCaloriesPerMinute: 6,
      avgHeartRateIncrease: 15
    },
    isCompound: false,
    isUnilateral: false,
    movementPattern: "Push",
    tags: ["triceps", "arms", "bodyweight", "chair"]
  },

  // Back Exercises
  {
    name: "Superman",
    category: "Strength",
    primaryMuscles: ["Lower Back"],
    secondaryMuscles: ["Glutes", "Hamstrings"],
    equipment: ["None"],
    difficulty: 2,
    instructions: {
      setup: "Lie face down with arms extended overhead",
      execution: [
        "Simultaneously lift chest, arms, and legs off ground",
        "Hold for 2-3 seconds at the top",
        "Lower back down with control",
        "Keep neck in neutral position"
      ],
      breathing: "Exhale while lifting, inhale while lowering",
      commonMistakes: [
        "Lifting too high and straining neck",
        "Using momentum instead of muscle control",
        "Not engaging glutes"
      ]
    },
    metrics: {
      avgCaloriesPerMinute: 4,
      avgHeartRateIncrease: 8
    },
    isCompound: false,
    isUnilateral: false,
    movementPattern: "Hinge",
    tags: ["back", "glutes", "posture", "rehabilitation"]
  }
];

export const seedExercises = async () => {
  try {
    console.log('🏋️‍♀️ Starting exercise seeder...');
    
    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log('✅ Cleared existing exercises');
    
    // Insert new exercises
    const insertedExercises = await Exercise.insertMany(sampleExercises);
    console.log(`✅ Inserted ${insertedExercises.length} exercises`);
    
    // Analytics
    const categoryStats = await Exercise.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgDifficulty: { $avg: '$difficulty' }
        }
      }
    ]);
    
    console.log('📊 Exercise Categories:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} exercises | Difficulty: ${stat.avgDifficulty.toFixed(1)}`);
    });
    
    console.log('🎉 Exercise seeder completed successfully!');
    return insertedExercises;
    
  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
    throw error;
  }
};

// Standalone execution
if (require.main === module) {
  const runSeeder = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gymsy');
      console.log('🔌 Connected to MongoDB');
      
      await seedExercises();
      
      await mongoose.connection.close();
      console.log('🔌 Disconnected from MongoDB');
      
      process.exit(0);
    } catch (error) {
      console.error('💥 Exercise seeder failed:', error);
      process.exit(1);
    }
  };
  
  runSeeder();
}