export interface Organization {
  id: string;
  name: string;
  domain: string;
  settings: OrganizationSettings;
  subscription: Subscription;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  allowedDomains: string[];
  defaultCurrency: string;
  timezone: string;
  bookingApprovalRequired: boolean;
  maxBookingAmount: number;
  corporateDiscounts: CorporateDiscount[];
}

export interface CorporateDiscount {
  airlineCode: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
}

export interface Subscription {
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  nextBillingDate: string;
  features: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  organizationId: string;
}

export interface EnterpriseUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
  organizationId: string;
  department?: string;
  employeeId?: string;
  manager?: EnterpriseUser;
  directReports: EnterpriseUser[];
  walletBalance: number;
  creditLimit: number;
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingPolicy {
  id: string;
  name: string;
  organizationId: string;
  rules: PolicyRule[];
  isActive: boolean;
}

export interface PolicyRule {
  type: 'max_amount' | 'advance_booking' | 'class_restriction' | 'route_restriction';
  value: any;
  condition: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  organizationId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  topRoutes: RouteAnalytics[];
  monthlyTrends: MonthlyTrend[];
  userActivity: UserActivity[];
}

export interface RouteAnalytics {
  route: string;
  bookings: number;
  revenue: number;
  averagePrice: number;
}

export interface MonthlyTrend {
  month: string;
  bookings: number;
  revenue: number;
  users: number;
}

export interface UserActivity {
  userId: string;
  userName: string;
  bookings: number;
  revenue: number;
  lastActivity: string;
}