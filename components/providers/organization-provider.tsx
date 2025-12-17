'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Organization, User, UserRole } from '@/types/auth';
import { hasPermission as checkPermission, PERMISSIONS } from '@/lib/auth/permissions';

interface OrganizationContextType {
  organization: Organization | null;
  user: User | null;
  isLoading: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  hasPermission: (permissionId: string) => boolean;
  isAdmin: boolean;
  isTravelManager: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      // TODO: Replace with actual API call
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Mock user data - replace with API call
      const mockUser: User = {
        id: '1',
        email: 'admin@company.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.ORG_ADMIN,
        organizationId: 'org-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrg: Organization = {
        id: 'org-1',
        name: 'Acme Corporation',
        slug: 'acme-corp',
        settings: {
          travelPolicy: {
            maxFlightCost: 5000,
            advanceBookingDays: 7,
            requireApproval: true,
            approvalThreshold: 1000,
            allowedClasses: ['economy', 'premium_economy'],
          },
          approvalWorkflow: {
            enabled: true,
            levels: [
              {
                level: 1,
                threshold: 1000,
                approverRoles: [UserRole.TRAVEL_MANAGER],
                requiredApprovers: 1,
              },
            ],
          },
          budgetLimits: {
            monthly: 50000,
            quarterly: 150000,
            annual: 500000,
            perTrip: 10000,
          },
          bookingRestrictions: {
            requireCostCenter: true,
            requireProjectCode: false,
            allowPersonalBookings: false,
            blackoutDates: [],
          },
        },
        subscription: 'enterprise' as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(mockUser);
      setOrganization(mockOrg);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = async (orgId: string) => {
    setIsLoading(true);
    try {
      // TODO: API call to switch organization
      console.log('Switching to organization:', orgId);
    } catch (error) {
      console.error('Failed to switch organization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return;
    
    try {
      // TODO: API call to update organization
      setOrganization({ ...organization, ...updates });
    } catch (error) {
      console.error('Failed to update organization:', error);
    }
  };

  const hasPermissionCheck = (permissionId: string): boolean => {
    if (!user) return false;
    
    const permission = Object.values(PERMISSIONS).find(p => p.id === permissionId);
    if (!permission) return false;
    
    return checkPermission(user.role, permission);
  };

  const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ORG_ADMIN;
  const isTravelManager = user?.role === UserRole.TRAVEL_MANAGER || isAdmin;

  const value: OrganizationContextType = {
    organization,
    user,
    isLoading,
    switchOrganization,
    updateOrganization,
    hasPermission: hasPermissionCheck,
    isAdmin,
    isTravelManager,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}