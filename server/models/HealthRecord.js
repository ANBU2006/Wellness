const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weight: { type: Number, default: null },
    height: { type: Number, default: null },
    bmi: { type: Number, default: null },
    category: { type: String, default: '' },
    sleepHours: { type: Number, default: 0 },
    exerciseMinutes: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure fields are not required
healthRecordSchema.path('weight').required(false);
healthRecordSchema.path('height').required(false);
healthRecordSchema.path('bmi').required(false);

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
