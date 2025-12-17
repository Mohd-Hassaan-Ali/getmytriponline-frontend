'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentMethod, Invoice, Payment } from '@/types/payment';
import { paymentService } from '@/lib/services/payment';
import { useOrganization } from '@/components/providers/organization-provider';

export function usePaymentMethods() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const {
    data: paymentMethods = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['paymentMethods', organization?.id],
    queryFn: () => organization ? paymentService.getPaymentMethods(organization.id) : [],
    enabled: !!organization,
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: (paymentData: any) => 
      paymentService.addPaymentMethod(organization!.id, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods', organization?.id] });
    },
  });

  return {
    paymentMethods,
    isLoading,
    error,
    addPaymentMethod: addPaymentMethodMutation.mutate,
    isAddingPaymentMethod: addPaymentMethodMutation.isPending,
  };
}

export function useInvoices() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const {
    data: invoices = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoices', organization?.id],
    queryFn: () => organization ? paymentService.getInvoices(organization.id) : [],
    enabled: !!organization,
  });

  const payInvoiceMutation = useMutation({
    mutationFn: ({ invoiceId, paymentMethodId }: { invoiceId: string; paymentMethodId: string }) =>
      paymentService.payInvoice(invoiceId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', organization?.id] });
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: (bookingIds: string[]) =>
      paymentService.generateInvoice(organization!.id, bookingIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', organization?.id] });
    },
  });

  return {
    invoices,
    isLoading,
    error,
    payInvoice: payInvoiceMutation.mutate,
    isPayingInvoice: payInvoiceMutation.isPending,
    generateInvoice: generateInvoiceMutation.mutate,
    isGeneratingInvoice: generateInvoiceMutation.isPending,
  };
}

export function usePaymentProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = async (paymentData: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    organizationId: string;
    bookingId?: string;
  }): Promise<Payment> => {
    setIsProcessing(true);
    try {
      const payment = await paymentService.processPayment(paymentData);
      
      // Poll for payment status if needed
      if (payment.status === 'processing') {
        await pollPaymentStatus(payment.id);
      }
      
      return payment;
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (paymentId: string): Promise<Payment> => {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const payment = await paymentService.getPaymentStatus(paymentId);
      
      if (payment.status !== 'processing') {
        return payment;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    throw new Error('Payment processing timeout');
  };

  return {
    processPayment,
    isProcessing,
  };
}