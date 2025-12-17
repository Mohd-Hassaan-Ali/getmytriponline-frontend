'use client';

import { useState } from 'react';
import { CreditCard, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PaymentMethod } from '@/types/payment';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function PaymentMethodCard({ paymentMethod, onDelete, onSetDefault }: PaymentMethodCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(paymentMethod.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCardIcon = () => {
    switch (paymentMethod.brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getCardIcon()}</div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{paymentMethod.name}</span>
              {paymentMethod.isDefault && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </div>
            {paymentMethod.last4 && (
              <p className="text-sm text-muted-foreground">
                •••• •••• •••• {paymentMethod.last4}
              </p>
            )}
            {paymentMethod.expiryMonth && paymentMethod.expiryYear && (
              <p className="text-xs text-muted-foreground">
                Expires {paymentMethod.expiryMonth.toString().padStart(2, '0')}/{paymentMethod.expiryYear}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!paymentMethod.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(paymentMethod.id)}
            >
              Set Default
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}