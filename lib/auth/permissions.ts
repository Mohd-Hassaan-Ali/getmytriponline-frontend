import { UserRole, Permission, RolePermission } from '@/types/auth';

// Define all permissions
export const PERMISSIONS = {
  // Organization Management
  ORG_READ: { id: 'org_read', name: 'Read Organization', resource: 'organization', action: 'read' },
  ORG_UPDATE: { id: 'org_update', name: 'Update Organization', resource: 'organization', action: 'update' },
  ORG_DELETE: { id: 'org_delete', name: 'Delete Organization', resource: 'organization', action: 'delete' },
  
  // User Management
  USER_READ: { id: 'user_read', name: 'Read Users', resource: 'user', action: 'read' },
  USER_CREATE: { id: 'user_create', name: 'Create Users', resource: 'user', action: 'create' },
  USER_UPDATE: { id: 'user_update', name: 'Update Users', resource: 'user', action: 'update' },
  USER_DELETE: { id: 'user_delete', name: 'Delete Users', resource: 'user', action: 'delete' },
  
  // Booking Management
  BOOKING_READ: { id: 'booking_read', name: 'Read Bookings', resource: 'booking', action: 'read' },
  BOOKING_CREATE: { id: 'booking_create', name: 'Create Bookings', resource: 'booking', action: 'create' },
  BOOKING_UPDATE: { id: 'booking_update', name: 'Update Bookings', resource: 'booking', action: 'update' },
  BOOKING_DELETE: { id: 'booking_delete', name: 'Delete Bookings', resource: 'booking', action: 'delete' },
  BOOKING_APPROVE: { id: 'booking_approve', name: 'Approve Bookings', resource: 'booking', action: 'approve' },
  
  // Financial
  FINANCE_READ: { id: 'finance_read', name: 'Read Financial Data', resource: 'finance', action: 'read' },
  FINANCE_EXPORT: { id: 'finance_export', name: 'Export Financial Data', resource: 'finance', action: 'export' },
  
  // Reports
  REPORT_READ: { id: 'report_read', name: 'Read Reports', resource: 'report', action: 'read' },
  REPORT_CREATE: { id: 'report_create', name: 'Create Reports', resource: 'report', action: 'create' },
  REPORT_EXPORT: { id: 'report_export', name: 'Export Reports', resource: 'report', action: 'export' },
  
  // Settings
  SETTINGS_READ: { id: 'settings_read', name: 'Read Settings', resource: 'settings', action: 'read' },
  SETTINGS_UPDATE: { id: 'settings_update', name: 'Update Settings', resource: 'settings', action: 'update' },
} as const;

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [UserRole.ORG_ADMIN]: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.ORG_UPDATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_DELETE,
    PERMISSIONS.BOOKING_APPROVE,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_EXPORT,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_CREATE,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
  ],
  
  [UserRole.TRAVEL_MANAGER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_APPROVE,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_CREATE,
    PERMISSIONS.SETTINGS_READ,
  ],
  
  [UserRole.APPROVER]: [
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_APPROVE,
    PERMISSIONS.REPORT_READ,
  ],
  
  [UserRole.TRAVELER]: [
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_UPDATE,
  ],
  
  [UserRole.VIEWER]: [
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.REPORT_READ,
  ],
};

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.some(p => p.id === permission.id);
}

export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function getUserPermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}