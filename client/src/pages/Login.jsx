import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Lock, Mail, User, Calendar, Activity } from 'lucide-react';

const Login = ({ defaultIsLogin = true }) => {
    const [isLogin, setIsLogin] = useState(defaultIsLogin);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formData, setFormData] = useState({ name: '', role: 'user', age: '', gender: 'Male', activityLevel: 'Sedentary' });
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            let user;
            if (isLogin) {
                user = await login(email, password);
            } else {
                user = await register({ ...formData, email, password });
            }
            if (user.role === 'coach') navigate('/coach');
            else navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || (isLogin ? 'Login failed' : 'Registration failed'));
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.75rem',
        border: '1.5px solid #E2E8F0', borderRadius: '0.75rem',
        fontSize: '0.9rem', fontFamily: 'inherit',
        outline: 'none', transition: 'border-color 0.18s, box-shadow 0.18s',
        background: '#F8FAFC', color: '#1E293B', boxSizing: 'border-box',
    };

    const iconStyle = {
        position: 'absolute', left: '12px', top: '50%',
        transform: 'translateY(-50%)', color: '#94A3B8',
        pointerEvents: 'none',
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #F0FDF4 50%, #FDF4FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
        }}>
            {/* Decorative blobs */}
            <div style={{ position: 'fixed', top: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(91,108,255,0.08)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(16,185,129,0.08)', pointerEvents: 'none' }} />

            <div style={{
                width: '100%',
                maxWidth: isLogin ? '440px' : '560px',
                background: 'white',
                borderRadius: '1.75rem',
                padding: '2.5rem',
                boxShadow: '0 25px 60px -15px rgba(91,108,255,0.15), 0 0 0 1px rgba(226,232,240,0.6)',
                transition: 'max-width 0.3s ease',
                position: 'relative',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {/* Logo mark */}
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '1rem',
                        background: 'linear-gradient(135deg, #5B6CFF 0%, #7C3AED 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 8px 20px rgba(91,108,255,0.35)',
                    }}>
                        <Activity size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.375rem' }}>
                        {isLogin ? 'Welcome back' : 'Create account'}
                    </h1>
                    <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                        {isLogin ? 'Log in to your wellness journey' : 'Start your health transformation today'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C',
                        borderRadius: '0.75rem', padding: '0.75rem 1rem',
                        marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 500,
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    {/* Name (register only) */}
                    {!isLogin && (
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={17} style={iconStyle} />
                                <input type="text" name="name" style={inputStyle} value={formData.name} onChange={handleInputChange} placeholder="Your full name" required
                                    onFocus={e => { e.target.style.borderColor = '#5B6CFF'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,255,0.12)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={17} style={iconStyle} />
                            <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required
                                onFocus={e => { e.target.style.borderColor = '#5B6CFF'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,255,0.12)'; }}
                                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={17} style={iconStyle} />
                            <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                                onFocus={e => { e.target.style.borderColor = '#5B6CFF'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,255,0.12)'; }}
                                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    {/* Register extra fields */}
                    {!isLogin && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={17} style={iconStyle} />
                                        <input type="number" name="age" style={inputStyle} value={formData.age} onChange={handleInputChange} placeholder="e.g. 25" required
                                            onFocus={e => { e.target.style.borderColor = '#5B6CFF'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,255,0.12)'; }}
                                            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</label>
                                    <select name="gender" style={{ ...inputStyle, paddingLeft: '0.875rem' }} value={formData.gender} onChange={handleInputChange}
                                        onFocus={e => { e.target.style.borderColor = '#5B6CFF'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,255,0.12)'; }}
                                        onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity Level</label>
                                <div style={{ position: 'relative' }}>
                                    <Activity size={17} style={iconStyle} />
                                    <select name="activityLevel" style={inputStyle} value={formData.activityLevel} onChange={handleInputChange}
                                        onFocus={e => { e.target.style.borderColor = '#5B6CFF'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,255,0.12)'; }}
                                        onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                                    >
                                        <option value="Sedentary">Sedentary</option>
                                        <option value="Lightly Active">Lightly Active</option>
                                        <option value="Moderately Active">Moderately Active</option>
                                        <option value="Very Active">Very Active</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Submit */}
                    <button type="submit" style={{
                        marginTop: '0.5rem',
                        width: '100%', padding: '0.875rem',
                        background: 'linear-gradient(135deg, #5B6CFF 0%, #7C3AED 100%)',
                        color: 'white', border: 'none',
                        borderRadius: '0.875rem', fontWeight: 700,
                        fontSize: '0.95rem', fontFamily: 'inherit',
                        cursor: 'pointer',
                        boxShadow: '0 6px 18px rgba(91,108,255,0.4)',
                        transition: 'all 0.2s ease',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(91,108,255,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(91,108,255,0.4)'; }}
                    >
                        {isLogin ? 'Log In →' : 'Create Account →'}
                    </button>
                </form>

                {/* Switch mode */}
                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#94A3B8' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#5B6CFF', fontWeight: 700, cursor: 'pointer' }}>
                        {isLogin ? 'Register now' : 'Log in'}
                    </span>
                </p>


            </div>
        </div>
    );
};

export default Login;
