import React, { useState } from 'react';
import { CurrencyIcon } from './icons/CurrencyIcon';
import { useAppStore } from '../store';

interface CurrencyValueProps {
  amount: number;
  className?: string;
  showIcon?: boolean;
}

export const CurrencyValue: React.FC<CurrencyValueProps> = ({ amount, className, showIcon = true }) => {
  const areEarningsVisible = useAppStore((s) => s.areEarningsVisible);
  const [isLocallyVisible, setIsLocallyVisible] = useState(false);

  const formattedAmount = amount.toLocaleString('ru-RU', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  });

  const isVisible = areEarningsVisible || isLocallyVisible;

  return (
    <span 
      className={`currency-value ${className} ${isVisible ? 'currency-value--visible' : 'currency-value--hidden'}`} 
      style={{ whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
      onClick={() => setIsLocallyVisible(!isLocallyVisible)}
      role="button"
      aria-label={isVisible ? 'Скрыть сумму' : 'Показать сумму'}
    >
      <span className="currency-value__amount">{formattedAmount}</span>
      {showIcon && <CurrencyIcon />}
    </span>
  );
};