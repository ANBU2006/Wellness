const mongoose = require('mongoose');
const HealthRecord = require('./models/HealthRecord');
require('dotenv').config();

const getCategory = (roundedBMI) => {
    if (roundedBMI < 18.5) return 'Underweight';
    else if (roundedBMI < 25) return 'Normal';
    else if (roundedBMI < 30) return 'Overweight';
    else return 'Obese';
};

const fixCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');

        const records = await HealthRecord.find({ bmi: { $ne: null } });
        console.log(`Found ${records.length} records to check...`);

        let fixed = 0;
        for (const record of records) {
            const roundedBMI = parseFloat(parseFloat(record.bmi).toFixed(2));
            const correctCategory = getCategory(roundedBMI);

            if (record.category !== correctCategory) {
                console.log(`Fixing BMI ${record.bmi}: "${record.category}" → "${correctCategory}"`);
                record.category = correctCategory;
                await record.save();
                fixed++;
            }
        }

        console.log(`\nDone! Fixed ${fixed} out of ${records.length} records.`);
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixCategories();
