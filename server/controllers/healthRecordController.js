const mongoose = require('mongoose');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const { getDateKey, getDayRangeFromDateKey, dedupeRecordsByDate } = require('../utils/healthRecordUtils');

const calculateBMI = (weight, height) => {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (isNaN(w) || isNaN(h) || h <= 0) {
        return { bmi: null, category: '' };
    }

    const heightInMeters = h / 100;
    const bmiValue = w / (heightInMeters * heightInMeters);
    const roundedBMI = parseFloat(bmiValue.toFixed(2));

    let category = '';
    if (roundedBMI < 18.5) category = 'Underweight';
    else if (roundedBMI < 25) category = 'Normal';
    else if (roundedBMI < 30) category = 'Overweight';
    else category = 'Obese';

    return { bmi: isNaN(roundedBMI) ? null : roundedBMI, category };
};

exports.addRecord = async (req, res) => {
    try {
        const { weight, height, date, sleepHours, exerciseMinutes } = req.body;
        const effectiveDate = date || Date.now();
        const dateKey = getDateKey(effectiveDate);
        const dayRange = getDayRangeFromDateKey(dateKey);

        // Upsert by (user, day): prevents duplicate daily entries.
        let record = await HealthRecord.findOne({
            userId: req.user.id,
            $or: [
                ...(dateKey ? [{ dateKey }] : []),
                ...(dayRange ? [{ date: { $gte: dayRange.start, $lte: dayRange.end } }] : [])
            ]
        }).sort({ updatedAt: -1, createdAt: -1 });

        if (record) {
            const w = parseFloat(weight);
            const h = parseFloat(height);

            if (!isNaN(w) && !isNaN(h) && h > 0) {
                record.weight = w;
                record.height = h;
                const { bmi, category } = calculateBMI(w, h);
                if (bmi !== null && !isNaN(bmi)) {
                    record.bmi = bmi;
                    record.category = category;
                }
            }

            if (date) record.date = date;
            if (dateKey) record.dateKey = dateKey;

            if (sleepHours !== undefined) {
                const sh = parseFloat(sleepHours);
                if (!isNaN(sh)) record.sleepHours = sh;
            }

            if (exerciseMinutes !== undefined) {
                const em = parseFloat(exerciseMinutes);
                if (!isNaN(em)) record.exerciseMinutes = em;
            }

            await record.save();
            return res.json(record);
        }

        const recordData = {
            userId: req.user.id,
            date: effectiveDate,
            dateKey,
            sleepHours: parseFloat(sleepHours) || 0,
            exerciseMinutes: parseFloat(exerciseMinutes) || 0,
            weight: null,
            height: null,
            bmi: null,
            category: ''
        };

        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (!isNaN(w) && !isNaN(h) && h > 0) {
            recordData.weight = w;
            recordData.height = h;
            const { bmi, category } = calculateBMI(w, h);
            if (bmi !== null && !isNaN(bmi)) {
                recordData.bmi = bmi;
                recordData.category = category;
            }
        }

        const newRecord = new HealthRecord(recordData);
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (err) {
        console.error('Add Record Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getUserRecords = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        const records = await HealthRecord.find({ userId }).sort({ date: -1 });
        const deduped = dedupeRecordsByDate(records).slice().reverse();
        res.json(deduped);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateRecord = async (req, res) => {
    try {
        const { weight, height, date, sleepHours, exerciseMinutes } = req.body;

        let record = await HealthRecord.findById(req.params.recordId);
        if (!record) return res.status(404).json({ message: 'Record not found' });

        if (record.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (!isNaN(w) && !isNaN(h) && h > 0) {
            record.weight = w;
            record.height = h;
            const { bmi, category } = calculateBMI(w, h);
            if (bmi !== null && !isNaN(bmi)) {
                record.bmi = bmi;
                record.category = category;
            }
        } else {
            // If weight/height aren't provided in this update, 
            // but they ALREADY exist on the record, we should re-calculate BMI if needed.
            // (Though in this app weight/height are usually updated together)
        }

        if (date) {
            record.date = date;
            const dateKey = getDateKey(date);
            if (dateKey) record.dateKey = dateKey;
        }

        if (sleepHours !== undefined) {
            const sh = parseFloat(sleepHours);
            if (!isNaN(sh)) record.sleepHours = sh;
        }

        if (exerciseMinutes !== undefined) {
            const em = parseFloat(exerciseMinutes);
            if (!isNaN(em)) record.exerciseMinutes = em;
        }

        await record.save();
        res.json(record);
    } catch (err) {
        console.error('Update Record Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.deleteRecord = async (req, res) => {
    try {
        const record = await HealthRecord.findById(req.params.recordId);
        if (!record) return res.status(404).json({ message: 'Record not found' });

        // Ensure user owns this record
        if (record.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await HealthRecord.findByIdAndDelete(req.params.recordId);
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
