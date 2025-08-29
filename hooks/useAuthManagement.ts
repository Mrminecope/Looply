import type { User } from '../types/app';

interface UseAuthManagementProps {
  setUser: (user: User | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function useAuthManagement({
  setUser,
  setIsAuthenticated,
  setShowAuthModal,
  setLoading,
  setError
}: UseAuthManagementProps) {
  
  const checkAuthStatus = () => {
    // Mock auth check for demo
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock login
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAuthenticated(true);
      setShowAuthModal(false);
    } catch (error) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    checkAuthStatus,
    login,
    logout
  };
}