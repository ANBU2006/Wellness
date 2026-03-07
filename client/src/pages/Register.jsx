import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'user',
        age: '', gender: 'Male', height: '', weight: '', activityLevel: 'Sedentary'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { role } = await register(formData);
            if (role === 'coach') navigate('/coach');
            else navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Start your health transformation today</p>

                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Unified Form Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1.25rem' }}>
                        {/* Name and Email - Full width (span 6) */}
                        <div className="form-group" style={{ gridColumn: 'span 6' }}>
                            <label className="form-label">Full Name</label>
                            <input type="text" name="name" className="form-input" onChange={handleChange} required />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 6' }}>
                            <label className="form-label">Email</label>
                            <input type="email" name="email" className="form-input" onChange={handleChange} required />
                        </div>

                        {/* Password - Full width (span 6) */}
                        <div className="form-group" style={{ gridColumn: 'span 6' }}>
                            <label className="form-label">Password</label>
                            <input type="password" name="password" className="form-input" onChange={handleChange} required />
                        </div>

                        {/* Health Profile Section Label - span 6 */}
                        <div style={{ gridColumn: 'span 6', margin: '0.5rem 0', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health Profile</h3>
                        </div>

                        {/* Age, Gender, Activity Level - 2 columns each (33% each) */}
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Age</label>
                            <input type="number" name="age" className="form-input" onChange={handleChange} required />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Gender</label>
                            <select name="gender" className="form-input" onChange={handleChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Activity Level</label>
                            <select name="activityLevel" className="form-input" onChange={handleChange}>
                                <option value="Sedentary">Sedentary</option>
                                <option value="Lightly Active">Lightly Active</option>
                                <option value="Moderately Active">Moderately Active</option>
                                <option value="Very Active">Very Active</option>
                            </select>
                        </div>

                        {/* Submit Button - span 6 */}
                        <div style={{ gridColumn: 'span 6', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Account</button>
                        </div>
                    </div>

                    <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
