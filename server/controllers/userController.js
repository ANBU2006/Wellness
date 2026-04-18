const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const DietPlan = require('../models/DietPlan');
const Advice = require('../models/Advice');
const { dedupeRecordsByDate, getDateKey, getDayRangeFromDateKey } = require('../utils/healthRecordUtils');

const calculateBMI = (weight, height) => {
    if (!weight || !height || height <= 0) return { bmi: null, category: '' };
    const heightInMeters = height / 100;
    const rawBMI = weight / (heightInMeters * heightInMeters);
    const roundedBMI = parseFloat(rawBMI.toFixed(2));
    let category = '';

    if (roundedBMI < 18.5) category = 'Underweight';
    else if (roundedBMI < 25) category = 'Normal';
    else if (roundedBMI < 30) category = 'Overweight';
    else category = 'Obese';

    return { bmi: roundedBMI, category };
};

const upsertDailyHealthRecord = async (userId, { weight, height, bmi, category }) => {
    const dateKey = getDateKey(new Date());
    const dayRange = getDayRangeFromDateKey(dateKey);
    let record = await HealthRecord.findOne({
        userId,
        $or: [
            ...(dateKey ? [{ dateKey }] : []),
            ...(dayRange ? [{ date: { $gte: dayRange.start, $lte: dayRange.end } }] : [])
        ]
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (!record) {
        record = new HealthRecord({
            userId,
            weight,
            height,
            bmi,
            category,
            dateKey
        });
    } else {
        record.weight = weight;
        record.height = height;
        record.bmi = bmi;
        record.category = category;
        if (dateKey) record.dateKey = dateKey;
    }

    await record.save();
    return record;
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch latest health record to show current metrics
        const latestRecord = await HealthRecord.findOne({ userId: req.user.id }).sort({ date: -1 });

        if (latestRecord) {
            user.weight = latestRecord.weight || user.weight;
            user.height = latestRecord.height || user.height;
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, height, weight, activityLevel, age, gender } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (gender) user.gender = gender;
        if (age) user.age = Number(age);

        // Only standard users have activity level, height, and weight profile fields
        if (user.role !== 'coach') {
            if (activityLevel) user.activityLevel = activityLevel;

            if (height || weight) {
                const h = height ? Number(height) : user.height;
                const w = weight ? Number(weight) : user.weight;

                if (h !== user.height || w !== user.weight) {
                    user.height = h;
                    user.weight = w;
                    const { bmi, category } = calculateBMI(w, h);

                    await upsertDailyHealthRecord(user._id, {
                        weight: w,
                        height: h,
                        bmi,
                        category
                    });
                }
            }
        }

        await user.save();
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.updateHealthData = async (req, res) => {
    try {
        const { weight, height } = req.body;
        const user = await User.findById(req.user.id);

        if (weight) user.weight = weight;
        if (height) user.height = height;
        await user.save();

        const { bmi, category } = calculateBMI(user.weight, user.height);

        const record = await upsertDailyHealthRecord(user._id, {
            weight: user.weight,
            height: user.height,
            bmi,
            category
        });

        res.json({ message: 'Health data updated', record });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const historyRaw = await HealthRecord.find({ userId: req.user.id }).sort({ date: 1 });
        const history = dedupeRecordsByDate(historyRaw);

        // Default to profile data
        let currentBMI = 0;
        let category = 'N/A';
        let lastUpdate = user.updatedAt;

        // Fetch latest health record to show truly "Current" status
        const latestRecord = history.length > 0 ? history[history.length - 1] : null;
        let recommendations = null;

        if (latestRecord && latestRecord.bmi) {
            currentBMI = latestRecord.bmi;
            category = latestRecord.category;
            lastUpdate = latestRecord.date;

            // Only provide recommendations if we have actual health data
            recommendations = await DietPlan.findOne({ category: category || 'Normal' });
        } else {
            // Fallback to profile-based calculation if no records exist
            const profileBMI = calculateBMI(user.weight || 0, user.height || 0);
            currentBMI = profileBMI.bmi;
            category = profileBMI.category;
            // recommendations remains null
        }

        const advice = await Advice.findOne({ userId: req.user.id })
            .populate('coachId', 'name')
            .sort({ date: -1 });

        res.json({
            currentBMI,
            category,
            history,
            recommendations,
            advice,
            lastUpdate
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAdviceHistory = async (req, res) => {
    try {
        const adviceList = await Advice.find({ userId: req.user.id })
            .populate('coachId', 'name')
            .sort({ date: -1 });
        res.json(adviceList);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
