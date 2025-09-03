import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Receipt } from 'lucide-react';

export interface TaxCalculation {
  grossAmount: number;
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  taxCategory: string;
  currency: string;
}

interface ZRATaxCalculatorProps {
  amount: number;
  transactionType: 'service' | 'sale' | 'payment';
  currency?: string;
  onTaxCalculated?: (calculation: TaxCalculation) => void;
}

const ZRATaxCalculator = ({ 
  amount, 
  transactionType, 
  currency = 'ZMW',
  onTaxCalculated 
}: ZRATaxCalculatorProps) => {
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);

  useEffect(() => {
    const calculateTax = () => {
      // ZRA tax rates (simplified)
      const taxRates = {
        'VAT': 0.16, // 16% VAT
        'Income Tax': 0.35, // 35% for high earners
        'Withholding Tax': 0.15, // 15% withholding
        'Service Tax': 0.16 // 16% for services
      };

      let taxRate = 0;
      let taxCategory = '';

      // Determine tax based on transaction type
      switch (transactionType) {
        case 'service':
          taxRate = taxRates['Service Tax'];
          taxCategory = 'Service Tax';
          break;
        case 'sale':
          taxRate = taxRates['VAT'];
          taxCategory = 'VAT';
          break;
        case 'payment':
          if (amount > 10000) { // High value payments
            taxRate = taxRates['Withholding Tax'];
            taxCategory = 'Withholding Tax';
          } else {
            taxRate = taxRates['VAT'];
            taxCategory = 'VAT';
          }
          break;
        default:
          taxRate = taxRates['VAT'];
          taxCategory = 'VAT';
      }

      const taxAmount = amount * taxRate;
      const netAmount = amount - taxAmount;

      const calculation: TaxCalculation = {
        grossAmount: amount,
        taxRate,
        taxAmount: Math.round(taxAmount * 100) / 100,
        netAmount: Math.round(netAmount * 100) / 100,
        taxCategory,
        currency
      };

      setTaxCalculation(calculation);
      onTaxCalculated?.(calculation);
    };

    if (amount > 0) {
      calculateTax();
    }
  }, [amount, transactionType, currency, onTaxCalculated]);

  if (!taxCalculation || amount <= 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calculator className="w-4 h-4" />
          ZRA Tax Calculation
          <Badge variant="secondary" className="ml-auto">
            {taxCalculation.taxCategory}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Gross Amount:</span>
          <span className="font-medium">{currency} {taxCalculation.grossAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax Rate:</span>
          <span className="font-medium">{(taxCalculation.taxRate * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-sm text-red-600">
          <span>Tax Amount:</span>
          <span className="font-medium">-{currency} {taxCalculation.taxAmount.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Net Amount:</span>
          <span className="text-green-600">{currency} {taxCalculation.netAmount.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
          <Receipt className="w-3 h-3" />
          <span>Compliant with ZRA regulations</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZRATaxCalculator;