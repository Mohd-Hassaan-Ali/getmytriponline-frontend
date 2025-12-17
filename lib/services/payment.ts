import { PaymentMethod, Payment, Invoice, PaymentStatus } from '@/types/payment';
import { env } from '@/lib/config/env';

class PaymentService {
  private baseUrl = env.NEXT_PUBLIC_API_URL;

  async getPaymentMethods(organizationId: string): Promise<PaymentMethod[]> {
    const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/payment-methods`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async addPaymentMethod(organizationId: string, paymentData: any): Promise<PaymentMethod> {
    const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/payment-methods`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(paymentData),
    });
    return response.json();
  }

  async processPayment(paymentData: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    organizationId: string;
    bookingId?: string;
  }): Promise<Payment> {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(paymentData),
    });
    return response.json();
  }

  async getPaymentStatus(paymentId: string): Promise<Payment> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getInvoices(organizationId: string): Promise<Invoice[]> {
    const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/invoices`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async generateInvoice(organizationId: string, bookingIds: string[]): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/invoices`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ bookingIds }),
    });
    return response.json();
  }

  async payInvoice(invoiceId: string, paymentMethodId: string): Promise<Payment> {
    const response = await fetch(`${this.baseUrl}/invoices/${invoiceId}/pay`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ paymentMethodId }),
    });
    return response.json();
  }

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
}

export const paymentService = new PaymentService();