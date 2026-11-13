import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Verify that an active session token exists in local storage
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
