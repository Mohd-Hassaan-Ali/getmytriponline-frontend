import { useAuthStore } from '@/lib/stores/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout, hasPermission } = useAuthStore();
  const router = useRouter();

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return false;
    }
    return true;
  };

  const requirePermission = (permission: string) => {
    if (!hasPermission(permission)) {
      router.push('/unauthorized');
      return false;
    }
    return true;
  };

  const signOut = () => {
    logout();
    router.push('/auth/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout: signOut,
    requireAuth,
    requirePermission,
    hasPermission,
  };
}

export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  return isAuthenticated;
}