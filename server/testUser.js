const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = new User({
            name: 'Test',
            email: 'test@test.com',
            password: 'password',
            height: 170,
            weight: 70
        });
        await user.save();
        console.log('User saved');
        process.exit();
    } catch (err) {
        console.error('Error Trace:', err);
        process.exit(1);
    }
}

test();
