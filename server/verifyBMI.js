const mongoose = require('mongoose');
const HealthRecord = require('./models/HealthRecord');
require('dotenv').config();

const getCorrectCategory = (roundedBMI) => {
    if (roundedBMI < 18.5) return 'Underweight';
    else if (roundedBMI < 25) return 'Normal';
    else if (roundedBMI < 30) return 'Overweight';
    else return 'Obese';
};

const verifyAll = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const records = await HealthRecord.find({ bmi: { $ne: null } }).sort({ bmi: 1 });

        console.log('\n===== BMI CATEGORY VERIFICATION =====\n');
        console.log('BMI\t\tStored\t\t\tCorrect\t\t\tStatus');
        console.log('─'.repeat(70));

        let allCorrect = true;
        for (const r of records) {
            const rounded = parseFloat(parseFloat(r.bmi).toFixed(2));
            const correct = getCorrectCategory(rounded);
            const status = r.category === correct ? '✅ OK' : '❌ WRONG';
            if (r.category !== correct) allCorrect = false;
            console.log(`${r.bmi}\t\t${r.category}\t\t${correct}\t\t${status}`);
        }

        console.log('\n' + '─'.repeat(70));
        console.log(allCorrect
            ? '✅ ALL RECORDS ARE CORRECT!'
            : '❌ Some records still have wrong categories!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyAll();
