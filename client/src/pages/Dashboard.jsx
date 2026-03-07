import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Activity, Apple, Dumbbell, MessageSquare, TrendingUp, Clock, ChevronRight, Heart } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/user/dashboard')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #EEF2FF', borderTopColor: '#5B6CFF', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                <p style={{ color: '#94A3B8', fontWeight: 600 }}>Loading your dashboard…</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="main-content" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '1rem', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Activity size={32} color="#F97316" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No data yet</h2>
            <p style={{ color: '#94A3B8' }}>Please update your profile to start tracking.</p>
        </div>
    );

    const { currentBMI, category, recommendations, advice, lastUpdate, history } = data;

    const bmiColors = {
        Underweight: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
        Normal: { bg: '#F0FDF4', color: '#15803D', border: '#86EFAC' },
        Overweight: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
        Obese: { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
    };
    const bmiTheme = bmiColors[category] || { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' };

    // ── Streak calculation ──
    const calcStreak = (historyArr) => {
        if (!historyArr || historyArr.length === 0) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = [...new Set(
            historyArr.map(h => new Date(h.date).toISOString().split('T')[0])
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

    const streak = calcStreak(history || []);
    const streakEmoji = streak >= 30 ? '🏆' : streak >= 14 ? '🔥' : streak >= 7 ? '⚡' : streak >= 3 ? '✨' : '📅';
    const streakMsg = streak >= 30 ? 'Incredible! Month-long streak!' : streak >= 14 ? 'Two weeks strong!' : streak >= 7 ? 'One week streak!' : streak >= 3 ? 'Great consistency!' : streak === 1 ? 'Streak started — keep going!' : 'Log today to start your streak!';

    const bmiRanges = [
        { label: 'Underweight', range: '< 18.5', color: '#1D4ED8', bg: '#DBEAFE' },
        { label: 'Normal', range: '18.5 – 24.9', color: '#15803D', bg: '#DCFCE7' },
        { label: 'Overweight', range: '25 – 29.9', color: '#B45309', bg: '#FEF3C7' },
        { label: 'Obese', range: '≥ 30', color: '#B91C1C', bg: '#FEE2E2' },
    ];

    return (
        <div className="main-content">
            {/* ── Page Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, #5B6CFF 0%, #7C3AED 100%)',
                borderRadius: '1.5rem',
                padding: '2rem 2.25rem',
                marginBottom: '1.75rem',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 16px 40px -8px rgba(91,108,255,0.35)',
            }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Heart size={18} color="rgba(255,255,255,0.8)" />
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Health Overview</span>
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>Pulse Dashboard</h1>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>Here's your personalised health summary for today.</p>
                </div>
            </div>

            {/* ── BMI + Advice row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* BMI Card */}
                <div style={{
                    background: bmiTheme.bg, border: `1.5px solid ${bmiTheme.border}`,
                    borderRadius: '1.25rem', padding: '1.75rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.625rem', background: bmiTheme.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={18} color={bmiTheme.color} />
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Current BMI</p>
                    </div>
                    <p style={{ fontSize: '3.5rem', fontWeight: 900, color: bmiTheme.color, lineHeight: 1 }}>{currentBMI || '--'}</p>
                    <span style={{
                        alignSelf: 'start', padding: '4px 12px',
                        background: bmiTheme.color + '18', color: bmiTheme.color,
                        borderRadius: '9999px', fontWeight: 700, fontSize: '0.8rem',
                        border: `1px solid ${bmiTheme.border}`,
                    }}>
                        {category || 'No Data'}
                    </span>
                    {lastUpdate && (
                        <p style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#94A3B8' }}>
                            <Clock size={12} /> Last updated: {new Date(lastUpdate).toLocaleDateString()}
                        </p>
                    )}
                </div>

                {/* Coach Advice Card */}
                <div className="card" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                        <span style={{ display: 'inline-flex', padding: '6px', background: '#EEF2FF', borderRadius: '8px', color: '#5B6CFF' }}>
                            <MessageSquare size={16} />
                        </span>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Advice from Coach</h2>
                    </div>
                    {advice ? (
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            background: 'linear-gradient(135deg, rgba(91,108,255,0.04), rgba(124,58,237,0.04))',
                            borderRadius: '1rem',
                            borderLeft: '4px solid #5B6CFF',
                        }}>
                            <p style={{ fontStyle: 'italic', color: '#334155', lineHeight: 1.7, fontSize: '0.95rem' }}>"{advice.content}"</p>
                            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>
                                — Coach {advice.coachId?.name}, {new Date(advice.date).toLocaleDateString()}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: '#F8FAFC', borderRadius: '1rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '0.75rem', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <MessageSquare size={20} color="#5B6CFF" />
                            </div>
                            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No advice received yet. Your coach will update you soon.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── BMI Range Reference + Streak row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

                {/* BMI Range Reference Card */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                        <span style={{ display: 'inline-flex', padding: '6px', background: '#F0FDF4', borderRadius: '8px', color: '#15803D' }}>
                            <TrendingUp size={16} />
                        </span>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>BMI Range Guide</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                        {bmiRanges.map((r) => {
                            const isActive = category === r.label;
                            return (
                                <div key={r.label} style={{
                                    background: r.bg,
                                    border: `2px solid ${isActive ? r.color : 'transparent'}`,
                                    borderRadius: '0.875rem',
                                    padding: '0.875rem 0.75rem',
                                    textAlign: 'center',
                                    position: 'relative',
                                    boxShadow: isActive ? `0 4px 14px ${r.color}33` : 'none',
                                    transition: 'all 0.2s ease',
                                }}>
                                    {isActive && (
                                        <span style={{
                                            position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                                            background: r.color, color: 'white', fontSize: '0.6rem', fontWeight: 800,
                                            padding: '2px 8px', borderRadius: '9999px', whiteSpace: 'nowrap',
                                        }}>YOU ARE HERE</span>
                                    )}
                                    <p style={{ fontSize: '0.72rem', fontWeight: 800, color: r.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{r.label}</p>
                                    <p style={{ fontSize: '1rem', fontWeight: 900, color: r.color }}>{r.range}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Daily Entry Streak Card */}
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', alignSelf: 'flex-start' }}>
                        <span style={{ display: 'inline-flex', padding: '6px', background: '#FFF7ED', borderRadius: '8px', color: '#F97316' }}>
                            <Activity size={16} />
                        </span>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Daily Streak</h2>
                    </div>
                    <div style={{
                        width: '90px', height: '90px', borderRadius: '50%',
                        background: streak > 0
                            ? 'linear-gradient(135deg, #F97316, #EF4444)'
                            : 'linear-gradient(135deg, #E2E8F0, #CBD5E1)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: streak > 0 ? '0 8px 24px rgba(249,115,22,0.35)' : 'none',
                        marginBottom: '0.875rem',
                    }}>
                        <span style={{ fontSize: '2rem', lineHeight: 1 }}>{streakEmoji}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: streak > 0 ? 'rgba(255,255,255,0.9)' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {streak} {streak === 1 ? 'day' : 'days'}
                        </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: streak > 0 ? '#F97316' : '#94A3B8', lineHeight: 1.4 }}>{streakMsg}</p>
                    <button
                        onClick={() => navigate('/progress')}
                        style={{
                            marginTop: '0.875rem', padding: '0.5rem 1.25rem',
                            background: streak > 0 ? 'linear-gradient(135deg, #F97316, #EF4444)' : '#5B6CFF',
                            color: 'white', border: 'none', borderRadius: '0.75rem',
                            fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer',
                            boxShadow: streak > 0 ? '0 4px 12px rgba(249,115,22,0.35)' : '0 4px 12px rgba(91,108,255,0.3)',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {streak > 0 ? 'Keep It Going →' : 'Log Today →'}
                    </button>
                </div>
            </div>

            {/* ── Diet + Exercise row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Diet */}
                <div className="card" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                        <span style={{ display: 'inline-flex', padding: '6px', background: '#F0FDF4', borderRadius: '8px', color: '#22C55E' }}>
                            <Apple size={16} />
                        </span>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Diet Recommendations</h2>
                    </div>
                    {recommendations ? (
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {recommendations.dietRecommendations.map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.625rem 0.875rem', background: '#F0FDF4', borderRadius: '0.75rem' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', marginTop: '7px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>{item}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            Update your weight and height in <strong>Progress</strong> to receive personalised diet recommendations.
                        </p>
                    )}
                </div>

                {/* Exercise */}
                <div className="card" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                        <span style={{ display: 'inline-flex', padding: '6px', background: '#FDF4FF', borderRadius: '8px', color: '#A855F7' }}>
                            <Dumbbell size={16} />
                        </span>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Exercise Plan</h2>
                    </div>
                    {recommendations ? (
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {recommendations.exerciseRecommendations.map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.625rem 0.875rem', background: '#FDF4FF', borderRadius: '0.75rem' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A855F7', marginTop: '7px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>{item}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            Update your health metrics to unlock a personalised exercise plan tailored to your BMI.
                        </p>
                    )}
                </div>
            </div>

            {/* ── CTA: Track Progress ── */}
            <div style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #EEF2FF 100%)',
                border: '1.5px solid #E2E8F0',
                borderRadius: '1.25rem', padding: '1.75rem 2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '0.875rem', background: 'linear-gradient(135deg, #5B6CFF 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(91,108,255,0.35)' }}>
                        <TrendingUp size={24} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2px' }}>Track Your Progress</h2>
                        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Log BMI, weight, sleep & exercise — view your trend charts.</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/progress')}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'linear-gradient(135deg, #5B6CFF 0%, #7C3AED 100%)',
                        color: 'white', border: 'none', borderRadius: '0.875rem',
                        padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '0.9rem',
                        fontFamily: 'inherit', cursor: 'pointer',
                        boxShadow: '0 6px 18px rgba(91,108,255,0.4)',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(91,108,255,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(91,108,255,0.4)'; }}
                >
                    View History Charts <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
