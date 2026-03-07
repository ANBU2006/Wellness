const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedCoach = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Check if coach already exists
        const existingCoach = await User.findOne({ email: 'coach@wellness.com' });
        if (existingCoach) {
            console.log('Coach account already exists');
            process.exit();
        }

        const coach = new User({
            name: 'Head Coach Sarah',
            email: 'coach@wellness.com',
            password: 'coachpassword123',
            role: 'coach',
            age: 35,
            gender: 'Female'
        });

        await coach.save();
        console.log('Coach account created successfully!');
        console.log('Email: coach@wellness.com');
        console.log('Password: coachpassword123');
        process.exit();
    } catch (err) {
        console.error('Error seeding coach:', err);
        process.exit(1);
    }
};

seedCoach();
