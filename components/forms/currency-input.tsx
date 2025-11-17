'use client';

import * as React from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface CurrencyInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  value?: number | string;
  onChange?: (value: number) => void;
  currency?: string;
  locale?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value = '', onChange, currency = 'IDR', locale = 'id-ID', className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    React.useEffect(() => {
      if (value !== undefined && value !== '') {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(numValue)) {
          setDisplayValue(formatNumber(numValue));
        } else {
          setDisplayValue('');
        }
      } else {
        setDisplayValue('');
      }
    }, [value]);

    const formatNumber = (num: number): string => {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(num);
    };

    const parseNumber = (str: string): number => {
      // Remove all non-numeric characters except decimal separator
      const cleaned = str.replace(/[^\d,.-]/g, '');
      // Replace comma with dot for parsing (if Indonesian locale)
      const normalized = cleaned.replace(/\./g, '').replace(',', '.');
      return parseFloat(normalized) || 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty input
      if (inputValue === '') {
        setDisplayValue('');
        onChange?.(0);
        return;
      }

      // Parse and format the number
      const numValue = parseNumber(inputValue);

      if (!isNaN(numValue)) {
        setDisplayValue(formatNumber(numValue));
        onChange?.(numValue);
      }
    };

    const handleBlur = () => {
      if (displayValue === '') {
        onChange?.(0);
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          {currency}
        </span>
        <Input
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn('pl-14', className)}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
