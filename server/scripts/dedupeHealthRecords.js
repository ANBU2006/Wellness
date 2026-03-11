require('dotenv').config();
const mongoose = require('mongoose');
const HealthRecord = require('../models/HealthRecord');
const { getDateKey } = require('../utils/healthRecordUtils');

const scoreRecord = (record) => {
    let score = 0;
    if (record?.weight !== null && record?.weight !== undefined) score += 1;
    if (record?.height !== null && record?.height !== undefined) score += 1;
    if (record?.bmi !== null && record?.bmi !== undefined) score += 1;
    if (record?.category) score += 1;
    if (Number(record?.sleepHours) > 0) score += 1;
    if (Number(record?.exerciseMinutes) > 0) score += 1;
    return score;
};

const pickBest = (a, b) => {
    const aScore = scoreRecord(a);
    const bScore = scoreRecord(b);
    if (aScore !== bScore) return aScore > bScore ? a : b;

    const aTime = new Date(a.updatedAt || a.createdAt || a.date).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || b.date).getTime();
    return aTime >= bTime ? a : b;
};

const run = async () => {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is missing in environment');
    }

    await mongoose.connect(mongoUri);
    const records = await HealthRecord.find({}).sort({ userId: 1, date: 1, updatedAt: -1, createdAt: -1 });

    const bestByUserDate = new Map();
    const allByUserDate = new Map();

    for (const record of records) {
        const key = `${record.userId.toString()}::${getDateKey(record.date)}`;
        const existing = bestByUserDate.get(key);
        if (!existing) bestByUserDate.set(key, record);
        else bestByUserDate.set(key, pickBest(existing, record));

        if (!allByUserDate.has(key)) allByUserDate.set(key, []);
        allByUserDate.get(key).push(record);
    }

    const keepIds = new Set(Array.from(bestByUserDate.values()).map(r => r._id.toString()));
    const deleteIds = [];

    for (const groupRecords of allByUserDate.values()) {
        for (const rec of groupRecords) {
            const id = rec._id.toString();
            if (!keepIds.has(id)) deleteIds.push(rec._id);
        }
    }

    if (deleteIds.length > 0) {
        await HealthRecord.deleteMany({ _id: { $in: deleteIds } });
    }

    const updates = [];
    for (const rec of bestByUserDate.values()) {
        const newDateKey = getDateKey(rec.date);
        if (rec.dateKey !== newDateKey) {
            updates.push(
                HealthRecord.updateOne(
                    { _id: rec._id },
                    { $set: { dateKey: newDateKey } }
                )
            );
        }
    }
    if (updates.length > 0) await Promise.all(updates);

    console.log(`Scanned: ${records.length}`);
    console.log(`Deleted duplicates: ${deleteIds.length}`);
    console.log(`Kept unique daily records: ${bestByUserDate.size}`);

    await mongoose.disconnect();
};

run()
    .then(() => process.exit(0))
    .catch(async (err) => {
        console.error(err);
        try { await mongoose.disconnect(); } catch (_) { }
        process.exit(1);
    });

