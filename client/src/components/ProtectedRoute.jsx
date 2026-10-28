import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from './ui.jsx';

// Wrap private pages: shows a spinner while checking the token, redirects to /login if logged out
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="center-screen"><Spinner size={28} /></div>;
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
