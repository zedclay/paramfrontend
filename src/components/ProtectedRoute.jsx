import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSkeleton from './LoadingSkeleton';

/**
 * ProtectedRoute Component
 * 
 * Secures routes by checking authentication and authorization.
 * Prevents unauthorized access to protected pages.
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string|null} requiredRole - Required role: 'admin', 'student', or null for any authenticated user
 * @param {boolean} redirectToHome - Whether to redirect to home or login page on unauthorized access
 */
const ProtectedRoute = ({ children, requiredRole = null, redirectToHome = false }) => {
  const { user, loading, isAdmin, isStudent, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth check to complete
    if (loading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      navigate('/login', { 
        replace: true,
        state: { from: window.location.pathname } // Save intended destination
      });
      return;
    }

    // Check role-based authorization
    if (requiredRole === 'admin' && !isAdmin) {
      console.warn('Unauthorized admin access attempt');
      navigate(redirectToHome ? '/' : '/login', { replace: true });
      return;
    }

    if (requiredRole === 'student' && !isStudent) {
      console.warn('Unauthorized student access attempt');
      navigate(redirectToHome ? '/' : '/login', { replace: true });
      return;
    }
  }, [user, loading, isAuthenticated, isAdmin, isStudent, requiredRole, navigate, redirectToHome]);

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Not authenticated or wrong role - component handles redirect
  if (!isAuthenticated || !user) {
    return null;
  }

  // Role check failed - component handles redirect
  if (requiredRole === 'admin' && !isAdmin) {
    return null;
  }

  if (requiredRole === 'student' && !isStudent) {
    return null;
  }

  // Authorized - render children
  return children;
};

export default ProtectedRoute;
