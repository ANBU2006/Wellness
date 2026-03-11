const getDateKey = (dateValue) => {
    const d = new Date(dateValue || Date.now());
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const getDayRangeFromDateKey = (dateKey) => {
    if (!dateKey) return null;
    const [y, m, d] = dateKey.split('-').map(Number);
    if (!y || !m || !d) return null;
    const start = new Date(y, m - 1, d, 0, 0, 0, 0);
    const end = new Date(y, m - 1, d, 23, 59, 59, 999);
    return { start, end };
};

const getRecordScore = (record) => {
    let score = 0;
    if (record?.weight !== null && record?.weight !== undefined) score += 1;
    if (record?.height !== null && record?.height !== undefined) score += 1;
    if (record?.bmi !== null && record?.bmi !== undefined) score += 1;
    if (record?.category) score += 1;
    if (Number(record?.sleepHours) > 0) score += 1;
    if (Number(record?.exerciseMinutes) > 0) score += 1;
    return score;
};

const isFirstRecordPreferred = (current, candidate) => {
    const currentScore = getRecordScore(current);
    const candidateScore = getRecordScore(candidate);
    if (currentScore !== candidateScore) return currentScore > candidateScore;

    const currentTime = new Date(current?.updatedAt || current?.createdAt || current?.date || 0).getTime();
    const candidateTime = new Date(candidate?.updatedAt || candidate?.createdAt || candidate?.date || 0).getTime();
    return currentTime >= candidateTime;
};

const dedupeRecordsByDate = (records = []) => {
    const byDate = new Map();

    for (const record of records) {
        const dateKey = getDateKey(record?.date);
        if (!dateKey) continue;

        const existing = byDate.get(dateKey);
        if (!existing || !isFirstRecordPreferred(existing, record)) {
            byDate.set(dateKey, record);
        }
    }

    return Array.from(byDate.values()).sort((a, b) => {
        const byDate = new Date(a.date) - new Date(b.date);
        if (byDate !== 0) return byDate;
        return new Date(a.updatedAt || a.createdAt || a.date) - new Date(b.updatedAt || b.createdAt || b.date);
    });
};

module.exports = {
    getDateKey,
    getDayRangeFromDateKey,
    dedupeRecordsByDate
};
