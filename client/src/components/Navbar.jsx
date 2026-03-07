import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LayoutDashboard, User, LineChart, LogOut, ShieldCheck, Activity } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { logout(); navigate('/login'); };
    const isActive = (path) => location.pathname === path;

    const navLinkStyle = (active) => ({
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '0.45rem 0.875rem',
        borderRadius: '0.625rem',
        fontWeight: 600, fontSize: '0.875rem',
        textDecoration: 'none',
        transition: 'all 0.18s ease',
        color: active ? '#5B6CFF' : '#64748B',
        background: active ? '#EEF2FF' : 'transparent',
    });

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(226,232,240,0.8)',
            padding: '0 2rem',
            height: '60px',
            display: 'flex', alignItems: 'center',
            boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
        }}>
            {/* Logo */}
            <Link to={user?.role === 'coach' ? '/coach' : '/dashboard'}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginRight: '2rem' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #5B6CFF 0%, #7C3AED 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Activity size={18} color="white" />
                </div>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(135deg, #5B6CFF, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    WELLNESS<span style={{ WebkitTextFillColor: '#1E293B' }}>+</span>
                </span>
            </Link>

            {/* Nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexGrow: 1 }}>
                {user?.role === 'user' ? (
                    <>
                        <Link to="/dashboard" style={navLinkStyle(isActive('/dashboard'))}>
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link to="/progress" style={navLinkStyle(isActive('/progress'))}>
                            <LineChart size={16} /> Progress
                        </Link>
                    </>
                ) : (
                    <Link to="/coach" style={navLinkStyle(isActive('/coach'))}>
                        <ShieldCheck size={16} /> Coach Panel
                    </Link>
                )}
                <Link to="/profile" style={navLinkStyle(isActive('/profile'))}>
                    <User size={16} /> Profile
                </Link>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#FEF2F2', color: '#EF4444',
                    border: '1px solid #FECACA',
                    borderRadius: '0.625rem',
                    padding: '0.4rem 0.875rem',
                    fontSize: '0.875rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
            >
                <LogOut size={16} /> Logout
            </button>
        </nav>
    );
};

export default Navbar;
