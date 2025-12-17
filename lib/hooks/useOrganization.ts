'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Organization, User } from '@/types/auth';

interface OrganizationContextType {
  organization: Organization | null;
  user: User | null;
  isLoading: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isTravelManager: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

export function useCurrentUser() {
  const { user, isLoading } = useOrganization();
  return { user, isLoading };
}

export function usePermissions() {
  const { hasPermission, isAdmin, isTravelManager } = useOrganization();
  return { hasPermission, isAdmin, isTravelManager };
}