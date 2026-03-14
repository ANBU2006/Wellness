const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:\\Projects\\Wellness\\server\\.env' });
const User = require('c:\\Projects\\Wellness\\server\\models\\User');
const HealthRecord = require('c:\\Projects\\Wellness\\server\\models\\HealthRecord');

const generateData = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create test user
    let user = await User.findOne({ email: 'graph_test@test.com' });
    if (!user) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);
        user = new User({
            name: 'Graph Test User',
            email: 'graph_test@test.com',
            password,
            role: 'user',
            age: 30,
            gender: 'Male',
            activityLevel: 'Lightly Active'
        });
        await user.save();
    }
    
    // Generate 365 days of records
    await HealthRecord.deleteMany({ user: user._id });
    
    const records = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let weight = 80;
    
    for (let i = 365; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        
        weight = weight - (Math.random() * 0.1 - 0.02); // very gradual downward trend with noise
        
        records.push({
            user: user._id,
            date: d.toISOString(),
            weight: parseFloat(weight.toFixed(1)),
            height: 180,
            bmi: parseFloat((weight / ((180/100)*(180/100))).toFixed(1)),
            category: weight < 75 ? 'Normal' : 'Overweight',
            exerciseMinutes: Math.floor(Math.random() * 40) + 10,
            sleepHours: parseFloat((Math.random() * 2 + 6).toFixed(1))
        });
    }
    
    await HealthRecord.insertMany(records);
    console.log('Seeded 365 records for graph_test@test.com password123');
    process.exit();
};

generateData().catch(console.error);
