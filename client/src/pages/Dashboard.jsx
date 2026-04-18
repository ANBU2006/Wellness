import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Activity, Apple, Dumbbell, MessageSquare, TrendingUp, Clock, ChevronRight, Heart, History, User } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adviceHistory, setAdviceHistory] = useState([]);
    const [historyExpanded, setHistoryExpanded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/user/dashboard')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
        api.get('/user/advice-history')
            .then(res => setAdviceHistory(res.data))
            .catch(console.error);
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
                        <Heart size={20} color="rgba(255,255,255,0.95)" />
                        <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Health Overview</span>
                    </div>
                    <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'white', marginBottom: '6px' }}>Pulse Dashboard</h1>
                    <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '1rem' }}>Here's your personalised health summary for today.</p>
                </div>
            </div>

            {/* ── BMI + Advice row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
                {/* BMI Card */}
                <div style={{
                    background: bmiTheme.bg, border: `1.5px solid ${bmiTheme.border}`,
                    borderRadius: '1.25rem', padding: '1.25rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.25rem', width: '100%' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.625rem', background: bmiTheme.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={18} color={bmiTheme.color} />
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Current BMI</p>
                    </div>
                    <p style={{ fontSize: '3.5rem', fontWeight: 900, color: bmiTheme.color, lineHeight: 1 }}>{currentBMI || '--'}</p>
                    <span style={{
                        alignSelf: 'center', padding: '4px 12px',
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
                <div className="card" style={{ padding: '1.75rem', minHeight: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                        <span style={{ display: 'inline-flex', padding: '6px', background: '#EEF2FF', borderRadius: '8px', color: '#5B6CFF' }}>
                            <MessageSquare size={16} />
                        </span>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Advice from Coach</h2>
                    </div>
                    {advice ? (
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            background: 'linear-gradient(135deg, rgba(91,108,255,0.04), rgba(124,58,237,0.04))',
                            borderRadius: '1rem',
                            borderLeft: '4px solid #5B6CFF',
                        }}>
                            <p style={{ fontStyle: 'italic', color: '#1e293b', lineHeight: 1.7, fontSize: '1rem' }}>"{advice.content}"</p>
                            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                                — Coach {advice.coachId?.name}, {new Date(advice.date).toLocaleDateString()}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: '#F8FAFC', borderRadius: '1rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '0.75rem', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <MessageSquare size={20} color="#5B6CFF" />
                            </div>
                            <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 500 }}>No advice received yet. Your coach will update you soon.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Diet + Exercise row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
                {/* Diet */}
                <div className="card" style={{ padding: '1.75rem', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                        <span style={{ display: 'inline-flex', padding: '6px', background: '#F0FDF4', borderRadius: '8px', color: '#22C55E' }}>
                            <Apple size={16} />
                        </span>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Diet Recommendations</h2>
                    </div>
                    {recommendations ? (
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                            {recommendations.dietRecommendations.map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.625rem 0.875rem', background: '#F0FDF4', borderRadius: '0.75rem' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', marginTop: '7px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.5, fontWeight: 500 }}>{item}</span>
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
                <div className="card" style={{ padding: '1.75rem', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                        <span style={{ display: 'inline-flex', padding: '6px', background: '#FDF4FF', borderRadius: '8px', color: '#A855F7' }}>
                            <Dumbbell size={16} />
                        </span>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Exercise Plan</h2>
                    </div>
                    {recommendations ? (
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                            {recommendations.exerciseRecommendations.map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.625rem 0.875rem', background: '#FDF4FF', borderRadius: '0.75rem' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A855F7', marginTop: '7px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.5, fontWeight: 500 }}>{item}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6 }}>
                            Update your health metrics to unlock a personalised exercise plan tailored to your BMI.
                        </p>
                    )}
                </div>
            </div>

            {/* ── Coach Advice History CTA + Expandable Timeline ── */}
            <div style={{ borderRadius: '1.25rem', overflow: 'hidden', border: '1.5px solid #E2E8F0' }}>
                {/* CTA Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #EEF2FF 0%, #FDF4FF 100%)',
                    padding: '1.75rem 2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '0.875rem',
                            background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 6px 16px rgba(168,85,247,0.35)', flexShrink: 0,
                        }}>
                            <History size={24} color="white" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px', color: '#1E293B' }}>
                                Coach Advice History
                            </h2>
                            <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 500 }}>
                                {adviceHistory.length > 0
                                    ? `${adviceHistory.length} advice message${adviceHistory.length > 1 ? 's' : ''} from your coach`
                                    : 'No advice received yet from your coach'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setHistoryExpanded(!historyExpanded)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
                            color: 'white', border: 'none', borderRadius: '0.875rem',
                            padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '1rem',
                            fontFamily: 'inherit', cursor: 'pointer',
                            boxShadow: '0 6px 18px rgba(168,85,247,0.4)',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(168,85,247,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(168,85,247,0.4)'; }}
                    >
                        {historyExpanded ? 'Hide History' : 'View Coach Advice History'}
                        <ChevronRight size={16} style={{ transform: historyExpanded ? 'rotate(270deg)' : 'rotate(90deg)', transition: 'transform 0.3s' }} />
                    </button>
                </div>

                {/* Expandable History Panel */}
                {historyExpanded && (
                    <div style={{ background: 'white', padding: '1.75rem 2rem', borderTop: '1.5px solid #E2E8F0' }}>
                        {adviceHistory.length === 0 ? (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                padding: '2rem', background: '#F8FAFC', borderRadius: '1rem', gap: '0.75rem',
                            }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '0.875rem', background: '#FDF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <History size={22} color="#A855F7" />
                                </div>
                                <p style={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.95rem', textAlign: 'center' }}>
                                    No advice history yet. Your coach will send advice soon.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', position: 'relative' }}>
                                {/* Vertical timeline line */}
                                <div style={{
                                    position: 'absolute', left: '19px', top: '28px',
                                    bottom: '28px', width: '2px',
                                    background: 'linear-gradient(180deg, #A855F733, #7C3AED33)',
                                    borderRadius: '1px',
                                }} />
                                {adviceHistory.map((item, idx) => (
                                    <div key={item._id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        {/* Timeline dot */}
                                        <div style={{
                                            flexShrink: 0, width: '38px', height: '38px', borderRadius: '50%',
                                            background: idx === 0
                                                ? 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)'
                                                : '#F3E8FF',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: idx === 0 ? '0 4px 12px rgba(168,85,247,0.35)' : 'none',
                                            zIndex: 1,
                                        }}>
                                            <User size={16} color={idx === 0 ? 'white' : '#A855F7'} />
                                        </div>
                                        {/* Advice bubble */}
                                        <div style={{
                                            flex: 1,
                                            background: idx === 0
                                                ? 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(124,58,237,0.06))'
                                                : '#F8FAFC',
                                            border: idx === 0
                                                ? '1.5px solid rgba(168,85,247,0.25)'
                                                : '1.5px solid #E2E8F0',
                                            borderRadius: '1rem', padding: '1rem 1.25rem',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>
                                                        Coach {item.coachId?.name || 'Unknown'}
                                                    </span>
                                                    {idx === 0 && (
                                                        <span style={{
                                                            padding: '1px 8px', borderRadius: '9999px',
                                                            background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                                                            color: 'white', fontSize: '0.7rem', fontWeight: 700,
                                                        }}>Latest</span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8', fontSize: '0.78rem', fontWeight: 500 }}>
                                                    <Clock size={12} />
                                                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <p style={{ fontStyle: 'italic', color: '#334155', lineHeight: 1.65, fontSize: '0.95rem' }}>
                                                "{item.content}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
