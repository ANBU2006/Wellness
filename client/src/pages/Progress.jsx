import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { Line } from 'react-chartjs-2';
import { Trash2, Edit, Calendar as CalendarIcon, Save, X, Moon, Zap, Ruler, Weight as WeightIcon, Activity, Plus } from 'lucide-react';
import annotationPlugin from 'chartjs-plugin-annotation';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    annotationPlugin
);

const Progress = () => {
    const toLocalDateKey = (dateValue = new Date()) => {
        const d = new Date(dateValue);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    const getTodayDate = () => toLocalDateKey(new Date());
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const [healthForm, setHealthForm] = useState({
        weight: '',
        height: '',
        exerciseMinutes: '',
        sleepHours: '',
        date: getTodayDate()
    });

    const [editingId, setEditingId] = useState(null);

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

    const dedupeByLocalDate = (records = []) => {
        const map = new Map();
        for (const rec of records) {
            const key = toLocalDateKey(rec.date);
            const existing = map.get(key);
            if (!existing) {
                map.set(key, rec);
                continue;
            }

            const existingScore = scoreRecord(existing);
            const recScore = scoreRecord(rec);
            if (recScore > existingScore) {
                map.set(key, rec);
                continue;
            }

            if (recScore === existingScore) {
                const existingTime = new Date(existing.updatedAt || existing.createdAt || existing.date).getTime();
                const recTime = new Date(rec.updatedAt || rec.createdAt || rec.date).getTime();
                if (recTime > existingTime) {
                    map.set(key, rec);
                }
            }
        }

        return Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // Helper to find record for a specific date string
    const findRecordForDate = (dateStr) => {
        const matches = (history || []).filter(h => toLocalDateKey(h.date) === dateStr);
        if (matches.length === 0) return null;

        // If duplicates exist for the same day, update the most recently changed one.
        return matches.sort((a, b) => {
            const aTime = new Date(a.updatedAt || a.createdAt || a.date).getTime();
            const bTime = new Date(b.updatedAt || b.createdAt || b.date).getTime();
            return bTime - aTime;
        })[0];
    };

    // Load existing data when date changes
    useEffect(() => {
        if (!healthForm.date || loading) return;

        const existing = findRecordForDate(healthForm.date);
        if (existing && !editingId) {
            setHealthForm(prev => ({
                ...prev,
                weight: existing.weight || '',
                height: existing.height || prev.height,
                exerciseMinutes: existing.exerciseMinutes || '',
                sleepHours: existing.sleepHours || ''
            }));
        }
    }, [healthForm.date, loading, editingId, history]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/user/dashboard');
            const sortedHistory = (res.data.history || []).sort((a, b) => {
                const byDate = new Date(a.date) - new Date(b.date);
                if (byDate !== 0) return byDate;
                return new Date(a.updatedAt || a.createdAt || a.date) - new Date(b.updatedAt || b.createdAt || b.date);
            });
            setHistory(dedupeByLocalDate(sortedHistory));

            // Auto-fill height from last record if available
            if (sortedHistory.length > 0) {
                const last = sortedHistory[sortedHistory.length - 1];
                setHealthForm(prev => ({ ...prev, height: last.height || prev.height }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...healthForm,
                weight: healthForm.weight ? Number(healthForm.weight) : null,
                height: healthForm.height ? Number(healthForm.height) : null,
                exerciseMinutes: healthForm.exerciseMinutes ? Number(healthForm.exerciseMinutes) : 0,
                sleepHours: healthForm.sleepHours ? Number(healthForm.sleepHours) : 0
            };

            const existing = findRecordForDate(healthForm.date);
            if (existing) {
                await api.put(`/health-records/${existing._id}`, payload);
            } else {
                await api.post('/health-records', payload);
            }

            setEditingId(null);
            fetchHistory();
            alert('Today\'s wellness status updated!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save record');
        }
    };

    const handleEdit = (record) => {
        setEditingId(record._id);
        const rDate = toLocalDateKey(record.date);

        setHealthForm({
            date: rDate,
            weight: record.weight || '',
            height: record.height || '',
            exerciseMinutes: record.exerciseMinutes || '',
            sleepHours: record.sleepHours || ''
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/health-records/${id}`);
            fetchHistory();
        } catch (err) {
            alert('Failed to delete record');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setHealthForm({ ...healthForm, weight: '', exerciseMinutes: '', sleepHours: '', date: getTodayDate() });
    };

    // Chart logic (Limit to last 30 days to prevent crowding)
    const recentHistory = history.slice(-30);
    const labels = recentHistory.map(h => new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

    const getBMIColor = (category) => {
        switch (category) {
            case 'Underweight': return '#3B82F6';
            case 'Normal': return '#22C55E';
            case 'Overweight': return '#F59E0B';
            case 'Obese': return '#EF4444';
            default: return '#94a3b8';
        }
    };

    const createGradient = (ctx, color) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, `${color}33`); // 0.2 opacity
        gradient.addColorStop(1, `${color}00`);
        return gradient;
    };

    const weightData = {
        labels,
        datasets: [{
            label: 'Weight (kg)',
            data: recentHistory.map(h => h.weight || null),
            borderColor: '#3B82F6',
            backgroundColor: (context) => context.chart.chartArea ? createGradient(context.chart.ctx, '#3B82F6') : null,
            pointBackgroundColor: '#3B82F6',
            fill: true,
            tension: 0.4,
            spanGaps: true
        }]
    };

    const sleepData = {
        labels,
        datasets: [{
            label: 'Sleep (hrs)',
            data: recentHistory.map(h => h.sleepHours || null),
            borderColor: '#6366F1',
            backgroundColor: (context) => context.chart.chartArea ? createGradient(context.chart.ctx, '#6366F1') : null,
            fill: true,
            tension: 0.4,
            spanGaps: true
        }]
    };

    const bmiData = {
        labels,
        datasets: [{
            label: 'BMI Value',
            data: recentHistory.map(h => h.bmi || null),
            borderColor: '#8B5CF6',
            backgroundColor: (context) => context.chart.chartArea ? createGradient(context.chart.ctx, '#8B5CF6') : null,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: recentHistory.map(h => getBMIColor(h.category)),
            pointBorderColor: recentHistory.map(h => getBMIColor(h.category)),
            spanGaps: true
        }]
    };

    const commonOptions = (title, yLabel) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: title, font: { size: 14, weight: '700' } },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 14, weight: '600' },
                bodyFont: { size: 13 },
                cornerRadius: 8,
                displayColors: false,
            }
        },
        scales: {
            y: { beginAtZero: false, title: { display: true, text: yLabel } },
            x: {
                grid: { display: false },
                ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 45,
                }
            }
        },
        interaction: { intersect: false, mode: 'index' }
    });

    const bmiOptions = {
        ...commonOptions('BMI Analysis', 'Score'),
        plugins: {
            ...commonOptions('BMI Analysis', 'Score').plugins,
            tooltip: {
                ...commonOptions('BMI Analysis', 'Score').plugins.tooltip,
                callbacks: {
                    label: (context) => {
                        const h = recentHistory[context.dataIndex];
                        return `BMI: ${context.parsed.y} (${h.category || 'N/A'})`;
                    }
                }
            }
        }
    };

    const sleepOptions = {
        ...commonOptions('Sleep Tracking', 'Hours'),
        plugins: {
            ...commonOptions('Sleep Tracking', 'Hours').plugins,
            annotation: {
                annotations: {
                    idealRange: {
                        type: 'box',
                        yMin: 7,
                        yMax: 8,
                        backgroundColor: 'rgba(34, 197, 94, 0.05)',
                        borderColor: 'transparent',
                    }
                }
            }
        }
    };

    const exerciseOptions = {
        ...commonOptions('Exercise Tracking', 'Minutes'),
        plugins: {
            ...commonOptions('Exercise Tracking', 'Minutes').plugins,
            annotation: {
                annotations: {
                    threshold: {
                        type: 'line',
                        yMin: 30,
                        yMax: 30,
                        borderColor: 'rgba(245, 158, 11, 0.5)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                    }
                }
            }
        }
    };

    const calcStreak = (historyArr) => {
        if (!historyArr || historyArr.length === 0) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = [...new Set(
            historyArr.map(h => toLocalDateKey(h.date))
        )].sort().reverse();

        let streak = 0;
        let cursor = new Date(today);
        for (const dayStr of days) {
            const d = new Date(dayStr);
            d.setHours(0, 0, 0, 0);
            const diff = Math.round((cursor - d) / 86400000);
            if (diff === 0 || diff === 1) {
                streak++;
                cursor = d;
            } else {
                break;
            }
        }
        return streak;
    };

    const streak = calcStreak(history);
    const streakEmoji = streak >= 30 ? '🏆' : streak >= 14 ? '🔥' : streak >= 7 ? '⚡' : streak >= 3 ? '✨' : '📅';
    const streakMsg = streak >= 30 ? 'Amazing consistency!' : streak >= 14 ? 'Two weeks strong!' : streak >= 7 ? 'Great momentum this week.' : streak >= 3 ? 'Nice consistency. Keep going.' : streak === 1 ? 'Great start! Keep it rolling.' : 'Start your streak today.';

    if (loading) return <div className="main-content">Loading...</div>;

    return (
        <div className="main-content">
            {/* ── Gradient Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)',
                borderRadius: '1.5rem',
                padding: '2rem 2.25rem',
                marginBottom: '1.75rem',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 16px 40px -8px rgba(14,165,233,0.35)',
            }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Activity size={20} color="rgba(255,255,255,0.95)" />
                        <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Health Analytics</span>
                    </div>
                    <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'white', marginBottom: '6px' }}>Pulse Analytics</h1>
                    <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '1rem' }}>Log your physical metrics and track your wellness trends.</p>
                </div>
            </div>

            {/* ── Top row: Log form + Streak ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '1.25rem',
                    padding: '1.75rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ display: 'inline-flex', padding: '5px', background: '#EEF2FF', borderRadius: '8px', color: '#5B6CFF' }}>
                                <Plus size={16} />
                            </span>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Log Today's Status</h2>
                        </div>
                        <p style={{ color: '#475569', fontSize: '0.95rem' }}>Record your physical metrics and last night's sleep.</p>
                    </div>

                    <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Date</label>
                            <input type="date" className="form-input" value={healthForm.date} onChange={e => setHealthForm({ ...healthForm, date: e.target.value })} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Weight (kg)</label>
                                <input type="number" step="0.1" className="form-input" value={healthForm.weight} onChange={e => setHealthForm({ ...healthForm, weight: e.target.value })} placeholder="e.g. 70" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Height (cm)</label>
                                <input type="number" className="form-input" value={healthForm.height} onChange={e => setHealthForm({ ...healthForm, height: e.target.value })} placeholder="e.g. 175" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Sleep (Last Night)</label>
                                <input type="number" step="0.5" className="form-input" value={healthForm.sleepHours} onChange={e => setHealthForm({ ...healthForm, sleepHours: e.target.value })} placeholder="e.g. 8" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Exercise (min)</label>
                                <input type="number" className="form-input" value={healthForm.exerciseMinutes} onChange={e => setHealthForm({ ...healthForm, exerciseMinutes: e.target.value })} placeholder="e.g. 30" />
                            </div>
                        </div>

                        <button type="submit" style={{
                            width: '100%', padding: '0.875rem',
                            background: 'linear-gradient(135deg, #0EA5E9, #10B981)',
                            color: 'white', border: 'none', borderRadius: '0.875rem',
                            fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit',
                            cursor: 'pointer', marginTop: '0.25rem',
                            boxShadow: '0 6px 16px rgba(14,165,233,0.35)',
                            transition: 'all 0.2s ease',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(14,165,233,0.45)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(14,165,233,0.35)'; }}
                        >
                            {editingId ? '✓ Update Entry' : '+ Save Today\'s Status'}
                        </button>

                        {editingId && (
                            <button type="button" style={{
                                width: '100%', padding: '0.75rem',
                                background: '#F1F5F9', color: '#64748B',
                                border: '1px solid #E2E8F0', borderRadius: '0.875rem',
                                fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer',
                            }}
                                onClick={() => { setEditingId(null); setHealthForm({ ...healthForm, weight: '', exerciseMinutes: '', sleepHours: '' }); }}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </form>
                </div>

                <div className="card" style={{
                    margin: 0,
                    minHeight: '100%',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 8px 20px rgba(15,23,42,0.06)',
                }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <span style={{ display: 'inline-flex', padding: '6px', background: '#FEE2E2', borderRadius: '9999px', color: '#DC2626' }}>
                            <Activity size={16} />
                        </span>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' }}>Daily Streak</h2>
                    </div>

                    <div style={{
                        width: '108px',
                        height: '108px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 24px rgba(220,38,38,0.25)',
                        marginBottom: '0.875rem',
                    }}>
                        <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{streakEmoji}</span>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {streak} {streak === 1 ? 'day' : 'days'}
                        </span>
                    </div>

                    <p style={{ fontSize: '2rem', fontWeight: 800, color: '#334155', lineHeight: 1, marginBottom: '0.375rem' }}>
                        {streak} {streak === 1 ? 'Day' : 'Days'}
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.9rem' }}>
                        {streakMsg}
                    </p>

                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.45, maxWidth: '330px', marginTop: '0.25rem' }}>
                        Keep logging your health data daily to maintain your streak.
                    </p>
                </div>
            </div>

            {/* ── Charts Area ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(430px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ height: '360px', margin: 0 }}>
                    <Line data={weightData} options={commonOptions('Weight Progress', 'kg')} />
                </div>
                <div className="card" style={{ height: '360px', margin: 0 }}>
                    <Line data={{
                        ...bmiData,
                        datasets: [{
                            ...bmiData.datasets[0],
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            pointBorderWidth: 2
                        }]
                    }} options={bmiOptions} />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '4px', fontSize: '9px', fontWeight: 600 }}>
                        <span style={{ color: '#3B82F6' }}>● Under</span>
                        <span style={{ color: '#22C55E' }}>● Normal</span>
                        <span style={{ color: '#F59E0B' }}>● Over</span>
                        <span style={{ color: '#EF4444' }}>● Obese</span>
                    </div>
                </div>
                <div className="card" style={{ height: '360px', margin: 0 }}>
                    <Line data={sleepData} options={sleepOptions} />
                </div>
                <div className="card" style={{ height: '360px', margin: 0 }}>
                    <Line
                        data={{
                            labels,
                            datasets: [{
                                label: 'Exercise (min)',
                                data: recentHistory.map(h => h.exerciseMinutes || null),
                                borderColor: '#10B981',
                                backgroundColor: (context) => context.chart.chartArea ? createGradient(context.chart.ctx, '#10B981') : null,
                                pointBackgroundColor: '#10B981',
                                fill: true,
                                tension: 0.4,
                                spanGaps: true
                            }]
                        }}
                        options={exerciseOptions}
                    />
                </div>
            </div>

            {/* ── History Table ── */}
            <div style={{
                background: 'white', border: '1px solid #E2E8F0',
                borderRadius: '1.25rem', marginTop: '2rem',
                overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
                <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', padding: '5px', background: '#EEF2FF', borderRadius: '8px', color: '#5B6CFF' }}>
                        <CalendarIcon size={16} />
                    </span>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Detailed History Log</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                        <colgroup>
                            <col style={{ width: '16%' }} />  {/* Date */}
                            <col style={{ width: '12%' }} />  {/* Weight */}
                            <col style={{ width: '12%' }} />  {/* Height */}
                            <col style={{ width: '12%' }} />  {/* BMI */}
                            <col style={{ width: '12%' }} />  {/* Category */}
                            <col style={{ width: '12%' }} />  {/* Sleep - same as Category */}
                            <col style={{ width: '12%' }} />  {/* Exercise */}
                            <col style={{ width: '12%' }} />  {/* Actions */}
                        </colgroup>
                        <thead>
                            <tr style={{ background: '#F8FAFC' }}>
                                {[
                                    { label: 'Date', align: 'left' },
                                    { label: 'Weight', align: 'left' },
                                    { label: 'Height', align: 'left' },
                                    { label: 'BMI', align: 'left' },
                                    { label: 'Category', align: 'left' },
                                    { label: 'Sleep\n(LN)', align: 'center' },
                                    { label: 'Exercise', align: 'left' },
                                    { label: 'Actions', align: 'right' },
                                ].map((col, i) => (
                                    <th key={i} style={{
                                        padding: '0.875rem 1rem',
                                        textAlign: col.align,
                                        fontSize: '0.82rem', fontWeight: 700,
                                        color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em',
                                        borderBottom: '1px solid #E2E8F0',
                                        whiteSpace: 'pre',
                                        lineHeight: 1.4,
                                        overflow: 'hidden',
                                    }}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {history.slice().reverse().map((h, idx) => {
                                const bmiCat = (h.category || '').toLowerCase();
                                const badgePalette = { underweight: ['#DBEAFE', '#1D4ED8'], normal: ['#DCFCE7', '#15803D'], overweight: ['#FEF3C7', '#B45309'], obese: ['#FEE2E2', '#B91C1C'] };
                                const [badgeBg, badgeColor] = badgePalette[bmiCat] || ['#F1F5F9', '#64748B'];
                                return (
                                    <tr key={h._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                                            {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#1e293b', fontWeight: 500 }}>{h.weight ? `${h.weight} kg` : <span style={{ color: '#CBD5E1' }}>—</span>}</td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#1e293b', fontWeight: 500 }}>{h.height ? `${h.height} cm` : <span style={{ color: '#CBD5E1' }}>—</span>}</td>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>{h.bmi || <span style={{ color: '#CBD5E1' }}>—</span>}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            {h.category ? (
                                                <span style={{ background: badgeBg, color: badgeColor, padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                    {h.category}
                                                </span>
                                            ) : <span style={{ color: '#CBD5E1' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#334155', textAlign: 'center' }}>{h.sleepHours ? `${h.sleepHours} hrs` : <span style={{ color: '#CBD5E1' }}>—</span>}</td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#1e293b', fontWeight: 500 }}>{h.exerciseMinutes ? `${h.exerciseMinutes} min` : <span style={{ color: '#CBD5E1' }}>—</span>}</td>
                                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                                            <button onClick={() => handleEdit(h)} style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                background: '#EEF2FF', border: 'none', color: '#5B6CFF',
                                                cursor: 'pointer', marginRight: '6px',
                                                transition: 'background 0.15s',
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#C7D2FE'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#EEF2FF'}
                                            ><Edit size={14} /></button>
                                            <button onClick={() => handleDelete(h._id)} style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                background: '#FEF2F2', border: 'none', color: '#EF4444',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s',
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FECACA'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                                            ><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {history.length === 0 && (
                                <tr><td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>No records yet. Log your first entry above!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Progress;
