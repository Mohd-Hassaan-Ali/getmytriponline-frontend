'use client';

import { useState } from 'react';
import { Download, Eye, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Invoice, InvoiceStatus } from '@/types/payment';

interface InvoiceCardProps {
  invoice: Invoice;
  onPay: (invoiceId: string) => void;
  onDownload: (invoiceId: string) => void;
  onView: (invoiceId: string) => void;
}

export function InvoiceCard({ invoice, onPay, onDownload, onView }: InvoiceCardProps) {
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async () => {
    setIsPaying(true);
    try {
      await onPay(invoice.id);
    } finally {
      setIsPaying(false);
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'bg-green-100 text-green-700';
      case InvoiceStatus.PENDING:
        return 'bg-yellow-100 text-yellow-700';
      case InvoiceStatus.OVERDUE:
        return 'bg-red-100 text-red-700';
      case InvoiceStatus.DRAFT:
        return 'bg-gray-100 text-gray-700';
      case InvoiceStatus.CANCELLED:
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Invoice #{invoice.number}</h3>
          <p className="text-sm text-muted-foreground">
            Due: {new Date(invoice.dueDate).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
          {invoice.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Subtotal:</span>
          <span className="text-sm">{formatCurrency(invoice.amount, invoice.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Tax:</span>
          <span className="text-sm">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => onView(invoice.id)}>
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDownload(invoice.id)}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        {invoice.status === InvoiceStatus.PENDING && (
          <Button size="sm" onClick={handlePay} disabled={isPaying}>
            <CreditCard className="h-4 w-4 mr-2" />
            {isPaying ? 'Processing...' : 'Pay Now'}
          </Button>
        )}
      </div>
    </Card>
  );
}