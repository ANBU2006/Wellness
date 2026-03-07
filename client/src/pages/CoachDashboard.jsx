import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
    Users, Layout, Send, ChevronRight, Activity, Trash2, Edit, Save, X,
    Moon, Zap, Plus, ArrowDown, Check, AlertTriangle, AlertCircle, Clock
} from 'lucide-react';

const CoachDashboard = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [adviceText, setAdviceText] = useState('');
    const [editingAdviceId, setEditingAdviceId] = useState(null);
    const [protocols, setProtocols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('users');

    // Modal states
    const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
    const [editingProtocol, setEditingProtocol] = useState(null);
    const [protocolFormData, setProtocolFormData] = useState({
        category: 'Normal',
        dietRecommendations: '',
        exerciseRecommendations: ''
    });

    const fetchProtocols = useCallback(async () => {
        try {
            let res;
            try {
                res = await api.get('/coach/plans');
            } catch (e) {
                res = await api.get('/coach/protocols');
            }
            setProtocols(res.data || []);
        } catch (err) {
            console.error('Error loading protocols:', err);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get('/coach/users');
            setUsers(res.data || []);
        } catch (err) {
            console.error('Error loading users:', err);
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await Promise.all([fetchUsers(), fetchProtocols()]);
            setLoading(false);
        };
        loadInitialData();
    }, [fetchUsers, fetchProtocols]);

    useEffect(() => {
        if (view === 'protocols') {
            fetchProtocols();
        }
    }, [view, fetchProtocols]);

    const handleSelectUser = async (user) => {
        try {
            const res = await api.get(`/coach/users/${user._id}`);
            setSelectedUser(res.data);
            setEditingAdviceId(null);
            setAdviceText('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdviceSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAdviceId) {
                await api.put(`/coach/advice/${editingAdviceId}`, { content: adviceText });
                setEditingAdviceId(null);
            } else {
                await api.post('/coach/advice', { userId: selectedUser.user._id, content: adviceText });
            }
            setAdviceText('');
            // Refresh detail panel
            const res = await api.get(`/coach/users/${selectedUser.user._id}`);
            setSelectedUser(res.data);
        } catch (err) {
            alert('Error updating advice');
        }
    };

    const handleEditAdvice = (advice) => {
        setEditingAdviceId(advice._id);
        setAdviceText(advice.content);
    };

    const handleDeleteAdvice = async (id) => {
        if (!window.confirm('Delete this advice?')) return;
        try {
            await api.delete(`/advice/${id}`); // Previous routes might use /advice
            // Refresh
            const res = await api.get(`/coach/users/${selectedUser.user._id}`);
            setSelectedUser(res.data);
        } catch (err) {
            // Try coach specific route if general fails
            try {
                await api.delete(`/coach/advice/${id}`);
                const res = await api.get(`/coach/users/${selectedUser.user._id}`);
                setSelectedUser(res.data);
            } catch (e) {
                alert('Error deleting advice');
            }
        }
    };

    const openProtocolModal = (protocol = null) => {
        if (protocol) {
            setEditingProtocol(protocol);
            setProtocolFormData({
                category: protocol.category || 'Normal',
                dietRecommendations: (protocol.dietRecommendations || protocol.dietItems || []).join('\n'),
                exerciseRecommendations: (protocol.exerciseRecommendations || protocol.exerciseItems || []).join('\n')
            });
        } else {
            setEditingProtocol(null);
            setProtocolFormData({
                category: 'Normal',
                dietRecommendations: '',
                exerciseRecommendations: ''
            });
        }
        setIsProtocolModalOpen(true);
    };

    const handleProtocolSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            category: protocolFormData.category,
            dietRecommendations: protocolFormData.dietRecommendations.split('\n').filter(i => i.trim()),
            exerciseRecommendations: protocolFormData.exerciseRecommendations.split('\n').filter(i => i.trim())
        };

        try {
            if (editingProtocol) {
                await api.put(`/coach/plans/${editingProtocol._id}`, payload);
            } else {
                await api.post('/coach/plans', payload);
            }
            setIsProtocolModalOpen(false);
            fetchProtocols();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving protocol');
        }
    };

    const handleDeleteProtocol = async (id) => {
        if (!window.confirm('Delete this protocol?')) return;
        try {
            await api.delete(`/coach/plans/${id}`);
            fetchProtocols();
        } catch (err) {
            alert('Error deleting protocol');
        }
    };

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'Underweight': return { border: '#3b82f6', bg: '#eff6ff', color: '#1d4ed8', icon: <ArrowDown size={20} /> };
            case 'Normal': return { border: '#10b981', bg: '#ecfdf5', color: '#047857', icon: <Check size={20} /> };
            case 'Overweight': return { border: '#f59e0b', bg: '#fffbeb', color: '#b45309', icon: <AlertTriangle size={20} /> };
            case 'Obese': return { border: '#ef4444', bg: '#fef2f2', color: '#b91c1c', icon: <AlertCircle size={20} /> };
            default: return { border: '#94a3b8', bg: '#f8fafc', color: '#1e293b', icon: <Activity size={20} /> };
        }
    };

    if (loading) return <div className="main-content">Loading...</div>;

    return (
        <div className="main-content">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Coach Command Center</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor users and manage health protocols.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setView('users')} className={`btn ${view === 'users' ? 'btn-primary' : ''}`} style={{ width: 'auto' }}>
                        <Users size={18} style={{ marginRight: '8px' }} /> Clients
                    </button>
                    <button onClick={() => setView('protocols')} className={`btn ${view === 'protocols' ? 'btn-primary' : ''}`} style={{ width: 'auto' }}>
                        <Layout size={18} style={{ marginRight: '8px' }} /> Protocols
                    </button>
                </div>
            </header>

            {view === 'users' ? (
                <div className="grid grid-cols-2" style={{ gridTemplateColumns: '1fr 2fr' }}>
                    {/* User List */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden', height: 'fit-content' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Client List</h2>
                        </div>
                        <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
                            {users.map(u => (
                                <div
                                    key={u._id}
                                    onClick={() => handleSelectUser(u)}
                                    className="user-item"
                                    style={{
                                        padding: '1rem 1.5rem',
                                        borderBottom: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        background: selectedUser?.user?._id === u._id ? '#f0f9ff' : 'transparent',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: 600 }}>{u.name}</p>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{u.email}</p>
                                    </div>
                                    <ChevronRight size={18} color="var(--text-muted)" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detail Panel */}
                    <div className="detail-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {selectedUser ? (
                            <>
                                <div className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                        <div>
                                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedUser.user.name}</h2>
                                            <p style={{ color: 'var(--text-muted)' }}>{selectedUser.user.age} yrs | {selectedUser.user.gender} | {selectedUser.user.activityLevel}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LATEST BMI</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                                                {selectedUser.history[selectedUser.history.length - 1]?.bmi || 'N/A'}
                                            </p>
                                            <span className={`bmi-badge badge-${(selectedUser.history[selectedUser.history.length - 1]?.category || '').toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                                                {selectedUser.history[selectedUser.history.length - 1]?.category || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.5rem', background: '#ede9fe', borderRadius: '0.5rem', color: '#8b5cf6', display: 'flex' }}>
                                                <Moon size={20} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>AVG SLEEP</p>
                                                <p style={{ fontWeight: 700 }}>{selectedUser.history.length > 0 ? (selectedUser.history.reduce((acc, curr) => acc + (curr.sleepHours || 0), 0) / selectedUser.history.length).toFixed(1) : 0} hrs</p>
                                            </div>
                                        </div>
                                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.5rem', background: '#fef3c7', borderRadius: '0.5rem', color: '#f59e0b', display: 'flex' }}>
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>AVG EXERCISE</p>
                                                <p style={{ fontWeight: 700 }}>{selectedUser.history.length > 0 ? (selectedUser.history.reduce((acc, curr) => acc + (curr.exerciseMinutes || 0), 0) / selectedUser.history.length).toFixed(0) : 0} min</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="advice-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                                            {editingAdviceId ? 'Edit Advice' : 'Personalize Guidance'}
                                        </h3>
                                        <form onSubmit={handleAdviceSubmit}>
                                            <textarea
                                                className="form-input"
                                                rows="3"
                                                placeholder="Provide advice..."
                                                value={adviceText}
                                                onChange={(e) => setAdviceText(e.target.value)}
                                                required
                                                style={{ marginBottom: '1rem', resize: 'none' }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                                                    {editingAdviceId ? 'Update Guidance' : 'Send Guidance'}
                                                </button>
                                                {editingAdviceId && (
                                                    <button type="button" onClick={() => { setEditingAdviceId(null); setAdviceText(''); }} className="btn" style={{ width: 'auto' }}>
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </form>

                                        <div style={{ marginTop: '2rem' }}>
                                            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem' }}>ADVICE HISTORY</h4>
                                            {selectedUser.adviceHistory?.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {selectedUser.adviceHistory.slice().reverse().map((adv) => (
                                                        <div key={adv._id} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', borderLeft: '3px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                            <div>
                                                                <p style={{ fontSize: '0.875rem' }}>{adv.content}</p>
                                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(adv.date).toLocaleDateString()}</p>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                                <button onClick={() => handleEditAdvice(adv)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Edit size={14} /></button>
                                                                <button onClick={() => handleDeleteAdvice(adv._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No previous advice recorded.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Historical Monitoring - premium table */}
                                <div style={{
                                    background: 'white', border: '1px solid #E2E8F0',
                                    borderRadius: '1.25rem', overflow: 'hidden',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                                }}>
                                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ display: 'inline-flex', padding: '5px', background: '#EEF2FF', borderRadius: '8px', color: '#5B6CFF' }}>
                                            <Moon size={15} />
                                        </span>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Historical Monitoring</h3>
                                    </div>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                            <colgroup>
                                                <col style={{ width: '18%' }} /> {/* Date */}
                                                <col style={{ width: '12%' }} /> {/* Weight */}
                                                <col style={{ width: '12%' }} /> {/* Height */}
                                                <col style={{ width: '10%' }} /> {/* BMI */}
                                                <col style={{ width: '16%' }} /> {/* Category */}
                                                <col style={{ width: '16%' }} /> {/* Sleep */}
                                                <col style={{ width: '16%' }} /> {/* Exercise */}
                                            </colgroup>
                                            <thead>
                                                <tr style={{ background: '#F8FAFC' }}>
                                                    {[
                                                        { label: 'Date' },
                                                        { label: 'Weight' },
                                                        { label: 'Height' },
                                                        { label: 'BMI' },
                                                        { label: 'Category' },
                                                        { label: 'Sleep\n(Last Night)' },
                                                        { label: 'Exercise' },
                                                    ].map((col, i) => (
                                                        <th key={i} style={{
                                                            padding: '0.75rem 1rem',
                                                            textAlign: 'left',
                                                            fontSize: '0.7rem', fontWeight: 700,
                                                            color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em',
                                                            borderBottom: '1px solid #E2E8F0',
                                                            whiteSpace: 'pre', lineHeight: 1.4,
                                                            overflow: 'hidden',
                                                        }}>{col.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedUser.history.slice().reverse().map((h, i) => {
                                                    const bmiCat = (h.category || '').toLowerCase();
                                                    const badgePalette = {
                                                        underweight: ['#DBEAFE', '#1D4ED8'],
                                                        normal: ['#DCFCE7', '#15803D'],
                                                        overweight: ['#FEF3C7', '#B45309'],
                                                        obese: ['#FEE2E2', '#B91C1C'],
                                                    };
                                                    const [badgeBg, badgeColor] = badgePalette[bmiCat] || ['#F1F5F9', '#64748B'];
                                                    return (
                                                        <tr key={i}
                                                            style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                                                            onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                                        >
                                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                                                {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </td>
                                                            <td style={{ padding: '0.75rem 1rem', color: '#334155', fontSize: '0.875rem' }}>
                                                                {h.weight ? `${h.weight} kg` : <span style={{ color: '#CBD5E1' }}>—</span>}
                                                            </td>
                                                            <td style={{ padding: '0.75rem 1rem', color: '#334155', fontSize: '0.875rem' }}>
                                                                {h.height ? `${h.height} cm` : <span style={{ color: '#CBD5E1' }}>—</span>}
                                                            </td>
                                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.875rem' }}>
                                                                {h.bmi || <span style={{ color: '#CBD5E1' }}>—</span>}
                                                            </td>
                                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                                {h.category ? (
                                                                    <span style={{ background: badgeBg, color: badgeColor, padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                                                                        {h.category}
                                                                    </span>
                                                                ) : <span style={{ color: '#CBD5E1' }}>—</span>}
                                                            </td>
                                                            <td style={{ padding: '0.75rem 1rem', color: '#334155', fontSize: '0.875rem' }}>
                                                                {h.sleepHours ? `${h.sleepHours} hrs` : <span style={{ color: '#CBD5E1' }}>—</span>}
                                                            </td>
                                                            <td style={{ padding: '0.75rem 1rem', color: '#334155', fontSize: '0.875rem' }}>
                                                                {h.exerciseMinutes ? `${h.exerciseMinutes} min` : <span style={{ color: '#CBD5E1' }}>—</span>}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {(!selectedUser.history || selectedUser.history.length === 0) && (
                                                    <tr><td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>No health records found for this client.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="card" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                <Activity size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Client Selected</h2>
                                <p>Select a client from the sidebar to view their full health history and provide guidance.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="protocols-view">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Protocol Management</h2>
                        <button onClick={() => openProtocolModal()} className="btn btn-primary" style={{ width: 'auto' }}>
                            <Plus size={18} style={{ marginRight: '8px' }} /> Add Protocol
                        </button>
                    </div>

                    <div className="grid grid-cols-2">
                        {protocols.length > 0 ? (
                            protocols.map(p => {
                                const styles = getCategoryStyles(p.category);
                                return (
                                    <div key={p._id} className="card" style={{ borderTop: `6px solid ${styles.border}`, padding: '0' }}>
                                        <div style={{ padding: '1.25rem', background: styles.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: styles.color }}>
                                                {styles.icon}
                                                <h3 style={{ fontWeight: 800 }}>{p.category} Protocol</h3>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => openProtocolModal(p)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Edit size={16} /></button>
                                                <button onClick={() => handleDeleteProtocol(p._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div style={{ padding: '1.25rem' }}>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Dietary Guidelines</h4>
                                                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                    {(p.dietRecommendations || p.dietItems || []).map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Exercise Strategy</h4>
                                                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                    {(p.exerciseRecommendations || p.exerciseItems || []).map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '3rem' }}>
                                <p>No protocols found. Use the button above to add one.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isProtocolModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', margin: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{editingProtocol ? 'Edit Protocol' : 'New Protocol'}</h2>
                            <button onClick={() => setIsProtocolModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleProtocolSubmit}>
                            <div className="form-group">
                                <label className="form-label">BMI Category</label>
                                <select
                                    className="form-input"
                                    value={protocolFormData.category}
                                    onChange={(e) => setProtocolFormData({ ...protocolFormData, category: e.target.value })}
                                    required
                                >
                                    <option value="Underweight">Underweight</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Overweight">Overweight</option>
                                    <option value="Obese">Obese</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dietary Guidelines (one per line)</label>
                                <textarea className="form-input" rows="4" value={protocolFormData.dietRecommendations} onChange={(e) => setProtocolFormData({ ...protocolFormData, dietRecommendations: e.target.value })} style={{ resize: 'none' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Exercise Strategy (one per line)</label>
                                <textarea className="form-input" rows="4" value={protocolFormData.exerciseRecommendations} onChange={(e) => setProtocolFormData({ ...protocolFormData, exerciseRecommendations: e.target.value })} style={{ resize: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                                <button type="button" onClick={() => setIsProtocolModalOpen(false)} className="btn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachDashboard;
