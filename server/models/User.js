const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'coach'], default: 'user' },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    activityLevel: { type: String, enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extra Active'] },
    createdAt: { type: Date, default: Date.now }
});

// Compare password (Direct string comparison - NO BCRYPT)
userSchema.methods.comparePassword = async function (candidatePassword) {
    return candidatePassword === this.password;
};

module.exports = mongoose.model('User', userSchema);
