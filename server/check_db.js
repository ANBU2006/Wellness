const mongoose = require('mongoose');
const DietPlan = require('./models/DietPlan');
require('dotenv').config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const plans = await DietPlan.find();
        console.log('--- Protocols Summary ---');
        plans.forEach((p, i) => {
            console.log(`${i + 1}. Category: ${p.category}`);
            console.log(`   Diet Count: ${p.dietRecommendations?.length}`);
            console.log(`   Exercise Count: ${p.exerciseRecommendations?.length}`);
        });
        process.exit();
    } catch (err) {
        console.error('Error checking DB:', err);
        process.exit(1);
    }
};

checkDB();
