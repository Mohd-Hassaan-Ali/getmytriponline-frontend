'use client';

import { ReactNode } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { UserRole } from '@/types/auth';

interface PermissionGuardProps {
  children: ReactNode;
  permissions?: string[];
  roles?: UserRole[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { user, hasPermission } = useOrganization();

  if (!user) {
    return <>{fallback}</>;
  }

  // Check role-based access
  if (roles.length > 0) {
    const hasRole = roles.includes(user.role);
    if (!hasRole) {
      return <>{fallback}</>;
    }
  }

  // Check permission-based access
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? permissions.every(permission => hasPermission(permission))
      : permissions.some(permission => hasPermission(permission));

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminGuard({ children, fallback = null }: AdminGuardProps) {
  return (
    <PermissionGuard
      roles={[UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

interface TravelManagerGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function TravelManagerGuard({ children, fallback = null }: TravelManagerGuardProps) {
  return (
    <PermissionGuard
      roles={[UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TRAVEL_MANAGER]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}