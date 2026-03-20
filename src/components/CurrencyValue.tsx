import React from 'react';
import { CurrencyIcon } from './icons/CurrencyIcon';

interface CurrencyValueProps {
  amount: number;
  className?: string;
  showIcon?: boolean;
}

export const CurrencyValue: React.FC<CurrencyValueProps> = ({ amount, className, showIcon = true }) => {
  const formattedAmount = amount.toLocaleString('ru-RU', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  });
  
  return (
    <span className={`currency-value ${className}`} style={{ whiteSpace: 'nowrap' }}>
      {formattedAmount}
      {showIcon && <CurrencyIcon />}
    </span>
  );
};
