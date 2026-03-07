import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CoachDashboard from './pages/CoachDashboard';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login defaultIsLogin={false} />} />
          <Route path="/*" element={
            <PrivateRoute>
              <div className="app-container">
                <Navbar />
                <Routes>
                  <Route path="/" element={
                    <AuthRedirect />
                  } />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/coach" element={<PrivateRoute roles={['coach']}><CoachDashboard /></PrivateRoute>} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/progress" element={<Progress />} />
                </Routes>
              </div>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const AuthRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'coach') return <Navigate to="/coach" />;
  return <Navigate to="/dashboard" />;
};

export default App;
