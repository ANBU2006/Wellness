const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const Advice = require('../models/Advice');
const DietPlan = require('../models/DietPlan');
const { dedupeRecordsByDate } = require('../utils/healthRecordUtils');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');
        const historyRaw = await HealthRecord.find({ userId }).sort({ date: 1 });
        const history = dedupeRecordsByDate(historyRaw);
        const adviceHistory = await Advice.find({ userId }).sort({ date: -1 });

        res.json({ user, history, adviceHistory });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.giveAdvice = async (req, res) => {
    try {
        const { userId, content } = req.body;
        const advice = new Advice({
            userId,
            coachId: req.user.id,
            content
        });
        await advice.save();
        res.status(201).json({ message: 'Advice sent successfully', advice });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.editAdvice = async (req, res) => {
    try {
        const { content } = req.body;
        const advice = await Advice.findByIdAndUpdate(
            req.params.adviceId,
            { content, date: Date.now() },
            { new: true }
        );
        if (!advice) return res.status(404).json({ message: 'Advice not found' });
        res.json(advice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteAdvice = async (req, res) => {
    try {
        const advice = await Advice.findByIdAndDelete(req.params.adviceId);
        if (!advice) return res.status(404).json({ message: 'Advice not found' });
        res.json({ message: 'Advice deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Protocol CRUD
exports.createProtocol = async (req, res) => {
    try {
        const { category, dietRecommendations, exerciseRecommendations } = req.body;
        const existing = await DietPlan.findOne({ category });
        if (existing) {
            return res.status(400).json({ message: `Protocol for ${category} already exists.` });
        }
        const plan = new DietPlan({
            category,
            dietRecommendations,
            exerciseRecommendations,
            updatedBy: req.user.id
        });
        await plan.save();
        res.status(201).json(plan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProtocol = async (req, res) => {
    try {
        const { category, dietRecommendations, exerciseRecommendations } = req.body;
        const plan = await DietPlan.findByIdAndUpdate(
            req.params.id,
            {
                category,
                dietRecommendations,
                exerciseRecommendations,
                updatedBy: req.user.id
            },
            { new: true }
        );
        if (!plan) return res.status(404).json({ message: 'Protocol not found' });
        res.json(plan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteProtocol = async (req, res) => {
    try {
        const plan = await DietPlan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Protocol not found' });
        res.json({ message: 'Protocol deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllProtocols = async (req, res) => {
    try {
        const plans = await DietPlan.find().sort({ createdAt: 1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllPlans = exports.getAllProtocols;

// Real-time stats for the Coach Profile page and Dashboard
exports.getStats = async (req, res) => {
    try {
        const HealthRecord = require('../models/HealthRecord');

        const totalClients = await User.countDocuments({ role: 'user' });
        const protocolsCreated = await DietPlan.countDocuments();
        const adviceSent = await Advice.countDocuments({ coachId: req.user.id });

        // Get the latest health record per user using aggregation
        const latestRecords = await HealthRecord.aggregate([
            { $sort: { date: -1 } },
            { $group: { _id: '$userId', category: { $first: '$category' } } }
        ]);

        let healthyClients = 0;
        let atRiskClients = 0;
        const AT_RISK = ['Underweight', 'Overweight', 'Obese'];

        latestRecords.forEach(r => {
            if (r.category === 'Normal') healthyClients++;
            else if (AT_RISK.includes(r.category)) atRiskClients++;
        });

        const activePrograms = latestRecords.length; // users with ≥1 record

        res.json({
            // Profile page stats
            clientsManaged: totalClients,
            protocolsCreated,
            adviceSent,
            activePrograms,
            // Dashboard bar stats
            totalClients,
            healthyClients,
            atRiskClients,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

