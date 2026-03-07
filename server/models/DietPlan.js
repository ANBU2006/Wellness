const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        unique: true,
        enum: ['Underweight', 'Normal', 'Overweight', 'Obese']
    },
    dietRecommendations: [{ type: String }],
    exerciseRecommendations: [{ type: String }],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
