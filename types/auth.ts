export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  settings: OrganizationSettings;
  subscription: SubscriptionTier;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  travelPolicy: TravelPolicy;
  approvalWorkflow: ApprovalWorkflow;
  budgetLimits: BudgetLimits;
  allowedDestinations?: string[];
  preferredAirlines?: string[];
  bookingRestrictions: BookingRestrictions;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  TRAVEL_MANAGER = 'travel_manager',
  APPROVER = 'approver',
  TRAVELER = 'traveler',
  VIEWER = 'viewer'
}

export enum SubscriptionTier {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom'
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: Permission[];
}

export interface TravelPolicy {
  maxFlightCost: number;
  advanceBookingDays: number;
  requireApproval: boolean;
  approvalThreshold: number;
  allowedClasses: ('economy' | 'premium_economy' | 'business' | 'first')[];
}

export interface ApprovalWorkflow {
  enabled: boolean;
  levels: ApprovalLevel[];
}

export interface ApprovalLevel {
  level: number;
  threshold: number;
  approverRoles: UserRole[];
  requiredApprovers: number;
}

export interface BudgetLimits {
  monthly: number;
  quarterly: number;
  annual: number;
  perTrip: number;
}

export interface BookingRestrictions {
  requireCostCenter: boolean;
  requireProjectCode: boolean;
  allowPersonalBookings: boolean;
  blackoutDates: string[];
}