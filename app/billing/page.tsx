'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { Plus, CreditCard, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentMethodCard } from '@/components/payment/payment-method-card';
import { InvoiceCard } from '@/components/payment/invoice-card';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { useOrganization } from '@/components/providers/organization-provider';
import { PaymentMethod, Invoice, InvoiceStatus } from '@/types/payment';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function BillingPage() {
  const { organization } = useOrganization();
  
  if (!organization) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, [organization]);

  const loadBillingData = async () => {
    if (!organization) return;
    
    setIsLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'credit_card',
          name: 'Corporate Visa',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
          organizationId: organization.id,
          createdAt: new Date(),
        },
        {
          id: '2',
          type: 'credit_card',
          name: 'Backup Card',
          last4: '1234',
          brand: 'mastercard',
          expiryMonth: 6,
          expiryYear: 2026,
          isDefault: false,
          organizationId: organization.id,
          createdAt: new Date(),
        },
      ];

      const mockInvoices: Invoice[] = [
        {
          id: '1',
          number: 'INV-2024-001',
          organizationId: organization.id,
          amount: 2500,
          currency: 'USD',
          status: InvoiceStatus.PENDING,
          dueDate: new Date('2024-02-15'),
          items: [],
          taxAmount: 250,
          totalAmount: 2750,
          createdAt: new Date(),
        },
        {
          id: '2',
          number: 'INV-2024-002',
          organizationId: organization.id,
          amount: 1800,
          currency: 'USD',
          status: InvoiceStatus.PAID,
          dueDate: new Date('2024-01-15'),
          paidAt: new Date('2024-01-10'),
          items: [],
          taxAmount: 180,
          totalAmount: 1980,
          createdAt: new Date(),
        },
      ];

      setPaymentMethods(mockPaymentMethods);
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    setPaymentMethods(prev => prev.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };

  const handlePayInvoice = async (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId 
        ? { ...inv, status: InvoiceStatus.PAID, paidAt: new Date() }
        : inv
    ));
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    console.log('Downloading invoice:', invoiceId);
  };

  const handleViewInvoice = async (invoiceId: string) => {
    console.log('Viewing invoice:', invoiceId);
  };

  const totalOutstanding = invoices
    .filter(inv => inv.status === InvoiceStatus.PENDING)
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <DashboardLayout>
      <PermissionGuard permissions={['finance_read']}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Billing & Payments</h1>
            <p className="text-gray-600">Manage payment methods and invoices</p>
          </div>

          {/* Billing Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalOutstanding.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalPaid.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Credit Limit</p>
                  <p className="text-2xl font-bold text-gray-900">$50,000</p>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="payment-methods" className="space-y-6">
            <TabsList>
              <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="payment-methods" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Payment Methods</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>

              <div className="grid gap-4">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    paymentMethod={method}
                    onDelete={handleDeletePaymentMethod}
                    onSetDefault={handleSetDefaultPaymentMethod}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Invoices</h2>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Invoice
                </Button>
              </div>

              <div className="grid gap-4">
                {invoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onPay={handlePayInvoice}
                    onDownload={handleDownloadInvoice}
                    onView={handleViewInvoice}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}