import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import {
    User, Mail, Calendar, Ruler, Weight, UserCircle, Edit2, Save, X,
    Users, LayoutTemplate, Send, Zap, ShieldCheck, Activity, TrendingUp
} from 'lucide-react';

/* ─────────────────────────────────────────
   Coach Profile Page
   ───────────────────────────────────────── */
const CoachProfile = ({ profile, onEdit }) => {
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        api.get('/coach/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error('Stats fetch error:', err))
            .finally(() => setStatsLoading(false));
    }, []);

    const statCards = [
        {
            icon: <Users size={22} />,
            label: 'Clients Managed',
            value: stats?.clientsManaged,
            bg: '#EEF2FF',
            iconBg: '#5B6CFF',
            color: '#5B6CFF',
        },
        {
            icon: <LayoutTemplate size={22} />,
            label: 'Protocols Created',
            value: stats?.protocolsCreated,
            bg: '#FFF7ED',
            iconBg: '#F97316',
            color: '#EA6C00',
        },
        {
            icon: <Send size={22} />,
            label: <>Advice<br />Sent</>,
            value: stats?.adviceSent,
            bg: '#F0FDF4',
            iconBg: '#22C55E',
            color: '#16A34A',
        },
        {
            icon: <Zap size={22} />,
            label: 'Active Programs',
            value: stats?.activePrograms,
            bg: '#FDF4FF',
            iconBg: '#A855F7',
            color: '#9333EA',
        },
    ];

    const details = [
        { icon: <Mail size={18} />, label: 'Email Address', value: profile.email || 'N/A' },
        { icon: <Calendar size={18} />, label: 'Age', value: profile.age ? `${profile.age} years` : 'N/A' },
        { icon: <UserCircle size={18} />, label: 'Gender', value: profile.gender || 'N/A' },
    ];

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* ── Hero / Top Section ── */}
            <div style={{
                background: 'linear-gradient(135deg, #5B6CFF 0%, #7C3AED 100%)',
                borderRadius: '1.5rem',
                padding: '2.5rem 2rem',
                marginBottom: '1.75rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px -8px rgba(91,108,255,0.35)',
            }}>
                {/* decorative circles */}
                <div style={{
                    position: 'absolute', top: '-60px', right: '-60px',
                    width: '220px', height: '220px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.07)',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-40px', left: '30%',
                    width: '150px', height: '150px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative' }}>
                    {/* Avatar + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '90px', height: '90px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            border: '3px solid rgba(255,255,255,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', flexShrink: 0,
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                        }}>
                            <UserCircle size={52} />
                        </div>

                        <div>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'white', marginBottom: '0.375rem', lineHeight: 1.2 }}>
                                {profile.name || 'Head Coach Bigil'}
                            </h1>
                            {/* Role badge */}
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white', fontWeight: 700, fontSize: '0.85rem',
                                padding: '5px 14px', borderRadius: '9999px',
                                letterSpacing: '0.06em', textTransform: 'uppercase',
                                border: '1px solid rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(6px)',
                            }}>
                                <ShieldCheck size={12} /> Coach
                            </span>
                        </div>
                    </div>

                    {/* Edit Profile button */}
                    <button
                        id="edit-profile-btn"
                        onClick={onEdit}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'white', color: '#5B6CFF',
                            border: 'none', borderRadius: '0.875rem',
                            padding: '0.625rem 1.375rem',
                            fontWeight: 700, fontSize: '0.9rem',
                            fontFamily: 'inherit', cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
                        }}
                    >
                        <Edit2 size={16} /> Edit Profile
                    </button>
                </div>
            </div>

            {/* ── Coach Details Card ── */}
            <div className="card" style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', padding: '5px', background: '#EEF2FF', borderRadius: '8px', color: '#5B6CFF' }}>
                        <User size={16} />
                    </span>
                    Coach Details
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {details.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '0.875rem',
                            padding: '1rem 1.125rem',
                            background: '#F8FAFC',
                            borderRadius: '0.875rem',
                            border: '1px solid #E2E8F0',
                            transition: 'box-shadow 0.2s',
                            gridColumn: 'span 1',
                        }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(91,108,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div style={{
                                flexShrink: 0, width: '38px', height: '38px',
                                borderRadius: '0.625rem',
                                background: '#EEF2FF', color: '#5B6CFF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {item.icon}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>
                                    {item.label}
                                </p>
                                <p title={item.value} style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Statistics Section ── */}
            <div className="card" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', padding: '5px', background: '#F0FDF4', borderRadius: '8px', color: '#22C55E' }}>
                        <Zap size={16} />
                    </span>
                    Performance Stats
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.125rem' }}>
                    {statCards.map((stat, i) => (
                        <div key={i} style={{
                            background: stat.bg,
                            borderRadius: '1.125rem',
                            padding: '1.5rem 1.25rem',
                            display: 'flex', flexDirection: 'column', gap: '1rem',
                            alignItems: 'center', textAlign: 'center',
                            border: '1px solid rgba(0,0,0,0.04)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            cursor: 'default',
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = `0 12px 28px -8px ${stat.iconBg}33`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: '46px', height: '46px', borderRadius: '0.75rem',
                                background: stat.iconBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white',
                                boxShadow: `0 6px 14px -4px ${stat.iconBg}88`,
                            }}>
                                {stat.icon}
                            </div>

                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                    {stat.label}
                                </p>
                                {statsLoading ? (
                                    <div style={{
                                        width: '48px', height: '32px',
                                        borderRadius: '6px',
                                        background: 'rgba(0,0,0,0.08)',
                                        animation: 'pulse 1.4s ease-in-out infinite',
                                    }} />
                                ) : (
                                    <p style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                                        {stat.value ?? 0}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   User Profile Page — Elegant Redesign
   ───────────────────────────────────────── */
const UserProfile = ({ profile, onEdit }) => {
    const details = [
        { icon: <Mail size={18} />, label: 'Email Address', value: profile.email || 'N/A', iconBg: '#EEF2FF', color: '#5B6CFF' },
        { icon: <Calendar size={18} />, label: 'Age', value: profile.age ? `${profile.age} years` : 'N/A', iconBg: '#FFF7ED', color: '#EA6C00' },
        { icon: <UserCircle size={18} />, label: 'Gender', value: profile.gender || 'N/A', iconBg: '#FDF4FF', color: '#9333EA' },
    ];

    const metrics = [
        { icon: <Ruler size={20} />, label: 'Height', value: profile.height ? `${profile.height} cm` : '--', iconBg: '#0EA5E9', cardBg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD' },
        { icon: <Weight size={20} />, label: 'Weight', value: profile.weight ? `${profile.weight} kg` : '--', iconBg: '#22C55E', cardBg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
    ];

    const activityColors = {
        'Sedentary': { bg: '#FEF2F2', color: '#B91C1C', border: '#FCA5A5' },
        'Lightly Active': { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
        'Moderately Active': { bg: '#FEFCE8', color: '#A16207', border: '#FDE68A' },
        'Very Active': { bg: '#F0FDF4', color: '#15803D', border: '#86EFAC' },
        'Extra Active': { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE' },
    };
    const actColor = activityColors[profile.activityLevel] || { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* ── Hero Banner (teal/emerald theme for users) ── */}
            <div style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)',
                borderRadius: '1.5rem',
                padding: '2.5rem 2rem',
                marginBottom: '1.75rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px -8px rgba(14,165,233,0.35)',
            }}>
                {/* decorative circles */}
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative' }}>
                    {/* Avatar + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '90px', height: '90px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            border: '3px solid rgba(255,255,255,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', flexShrink: 0,
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                        }}>
                            <UserCircle size={52} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'white', marginBottom: '0.375rem', lineHeight: 1.2 }}>
                                {profile.name}
                            </h1>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white', fontWeight: 700, fontSize: '0.75rem',
                                padding: '4px 12px', borderRadius: '9999px',
                                letterSpacing: '0.06em', textTransform: 'uppercase',
                                border: '1px solid rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(6px)',
                            }}>
                                <Activity size={12} /> Member
                            </span>
                        </div>
                    </div>

                    {/* Edit Profile button */}
                    <button
                        id="user-edit-profile-btn"
                        onClick={onEdit}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'white', color: '#0EA5E9',
                            border: 'none', borderRadius: '0.875rem',
                            padding: '0.625rem 1.375rem',
                            fontWeight: 700, fontSize: '0.9rem',
                            fontFamily: 'inherit', cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
                            transition: 'all 0.2s ease', flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)'; }}
                    >
                        <Edit2 size={16} /> Edit Profile
                    </button>
                </div>
            </div>

            {/* ── Personal Details Card ── */}
            <div className="card" style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', padding: '5px', background: '#EEF2FF', borderRadius: '8px', color: '#5B6CFF' }}>
                        <User size={16} />
                    </span>
                    Personal Details
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {details.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '0.875rem',
                            padding: '1rem 1.125rem',
                            background: '#F8FAFC', borderRadius: '0.875rem',
                            border: '1px solid #E2E8F0', transition: 'box-shadow 0.2s',
                            gridColumn: 'span 1',
                        }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(14,165,233,0.12)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div style={{
                                flexShrink: 0, width: '38px', height: '38px',
                                borderRadius: '0.625rem', background: item.iconBg,
                                color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {item.icon}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>
                                    {item.label}
                                </p>
                                <p title={item.value} style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Health Metrics ── */}
            <div className="card" style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', padding: '5px', background: '#F0FDF4', borderRadius: '8px', color: '#22C55E' }}>
                        <TrendingUp size={16} />
                    </span>
                    Health Metrics
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.125rem' }}>
                    {metrics.map((m, i) => (
                        <div key={i} style={{
                            background: m.cardBg, border: `1px solid ${m.border}`,
                            borderRadius: '1.125rem', padding: '1.5rem 1.25rem',
                            display: 'flex', flexDirection: 'column', gap: '0.875rem',
                            alignItems: 'center', textAlign: 'center',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 28px -8px ${m.iconBg}33`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <div style={{
                                width: '46px', height: '46px', borderRadius: '0.75rem',
                                background: m.iconBg, color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 6px 14px -4px ${m.iconBg}88`,
                            }}>
                                {m.icon}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>{m.label}</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Activity Level ── */}
            <div className="card" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', padding: '5px', background: '#FFF7ED', borderRadius: '8px', color: '#F97316' }}>
                        <Zap size={16} />
                    </span>
                    Activity Level
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '0.625rem 1.25rem',
                        background: actColor.bg, color: actColor.color,
                        border: `1.5px solid ${actColor.border}`,
                        borderRadius: '9999px', fontWeight: 700, fontSize: '0.95rem',
                    }}>
                        <Activity size={15} />
                        {profile.activityLevel || 'Not set'}
                    </span>
                    <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 500 }}>
                        Used by your coach to tailor health &amp; exercise recommendations.
                    </p>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   Edit Form
   ───────────────────────────────────────── */
const EditForm = ({ profile, formData, setFormData, onSubmit, onCancel, saving }) => (
    <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Update Information</h2>
            <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={22} /></button>
        </div>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>
            {profile.role === 'coach' ? (
                <div className="grid grid-cols-2">
                    <div className="form-group">
                        <label className="form-label">Age</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.age}
                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select
                            className="form-input"
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2">
                        <div className="form-group">
                            <label className="form-label">Age</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select
                                className="form-input"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Activity Level</label>
                        <select
                            className="form-input"
                            value={formData.activityLevel}
                            onChange={e => setFormData({ ...formData, activityLevel: e.target.value })}
                            required
                        >
                            <option value="Sedentary">Sedentary (Little to no exercise)</option>
                            <option value="Lightly Active">Lightly Active (Light exercise 1-3 days/week)</option>
                            <option value="Moderately Active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                            <option value="Very Active">Very Active (Hard exercise 6-7 days/week)</option>
                            <option value="Extra Active">Extra Active (Very hard exercise & physical job)</option>
                        </select>
                    </div>
                </>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                    <Save size={17} style={{ marginRight: '8px' }} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn"
                    style={{ width: 'auto', background: '#f1f5f9', color: 'var(--text-main)' }}
                >
                    <X size={17} style={{ marginRight: '8px' }} /> Cancel
                </button>
            </div>
        </form>
    </div>
);

/* ─────────────────────────────────────────
   Main Profile Component
   ───────────────────────────────────────── */
const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', height: '', weight: '', activityLevel: '', age: '', gender: ''
    });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/user/profile?t=${Date.now()}`);
            setProfile(res.data);
            setFormData({
                name: res.data.name,
                height: res.data.height || '',
                weight: res.data.weight || '',
                activityLevel: res.data.activityLevel || '',
                age: res.data.age || '',
                gender: res.data.gender || ''
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/user/profile', formData);
            await fetchProfile();
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Update profile error:', err.response?.data || err.message);
            alert('Error updating profile: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="main-content">Loading...</div>;

    return (
        <div className="main-content">
            {isEditing ? (
                <EditForm
                    profile={profile}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                    saving={saving}
                />
            ) : profile.role === 'coach' ? (
                <CoachProfile profile={profile} onEdit={() => setIsEditing(true)} />
            ) : (
                <UserProfile profile={profile} onEdit={() => setIsEditing(true)} />
            )}
        </div>
    );
};

export default Profile;
