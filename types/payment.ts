export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'corporate_card' | 'bank_transfer' | 'wallet';
  name: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  organizationId: string;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  taxAmount: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  createdAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  bookingId?: string;
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodId: string;
  invoiceId?: string;
  bookingId?: string;
  organizationId: string;
  processedAt?: Date;
  failureReason?: string;
  createdAt: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface BillingSettings {
  organizationId: string;
  billingEmail: string;
  billingAddress: Address;
  taxId?: string;
  currency: string;
  paymentTerms: number; // days
  autoPayEnabled: boolean;
  creditLimit: number;
  currentBalance: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}