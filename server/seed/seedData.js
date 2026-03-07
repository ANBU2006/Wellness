const mongoose = require('mongoose');
const DietPlan = require('../models/DietPlan');
require('dotenv').config();

const plans = [
    {
        category: 'Underweight',
        dietRecommendations: [
            'Increase calorie intake with nutrient-dense foods.',
            'Eat frequent small meals throughout the day.',
            'Include healthy fats like avocados, nuts, and olive oil.',
            'Protein-rich foods: chicken, fish, eggs, legumes.',
            'Smoothies and shakes with protein powder.'
        ],
        exerciseRecommendations: [
            'Focus on strength training to build muscle mass.',
            'Avoid excessive cardio.',
            'Compound movements: squats, deadlifts, bench press.',
            '2-3 days of resistance training per week.'
        ]
    },
    {
        category: 'Normal',
        dietRecommendations: [
            'Maintain a balanced diet with protein, carbs, and fats.',
            'Consume plenty of fruits and vegetables.',
            'Stay hydrated: 8-10 glasses of water daily.',
            'Limit processed sugars and excessive salt.',
            'Whole grains: oats, quinoa, brown rice.'
        ],
        exerciseRecommendations: [
            'Combination of cardio and strength training.',
            '150 minutes of moderate aerobic activity per week.',
            'Active hobbies: swimming, cycling, hiking.',
            'Yoga or stretching for flexibility.'
        ]
    },
    {
        category: 'Overweight',
        dietRecommendations: [
            'Focus on calorie deficit for gradual weight loss.',
            'High-fiber foods to keep you full longer.',
            'Lean proteins: turkey breast, tofu, white fish.',
            'Reduce portion sizes.',
            'Limit sugary drinks and high-calorie snacks.'
        ],
        exerciseRecommendations: [
            'Increase cardio frequency: 4-5 times per week.',
            'Brisk walking, jogging, or swimming.',
            'High-Intensity Interval Training (HIIT).',
            'Consistency is key for metabolism support.'
        ]
    },
    {
        category: 'Obese',
        dietRecommendations: [
            'Prioritize low-glycemic index foods.',
            'Eliminate processed foods and refined sugars.',
            'Consult with a nutritionist for a structured plan.',
            'Vegetable-heavy meals.',
            'Monitor caloric intake diligently.'
        ],
        exerciseRecommendations: [
            'Start with low-impact exercises: walking, water aerobics.',
            'Gradually increase intensity as stamina improves.',
            'Daily movement: aim for 5,000-10,000 steps.',
            'Focus on mobility and joint health.'
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        try {
            await mongoose.connection.dropCollection('dietplans');
        } catch (e) { }
        await DietPlan.insertMany(plans);
        console.log('Hybrid seed data inserted successfully');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedDB();
