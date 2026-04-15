import React from 'react';

export const CurrencyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="1em" 
    height="1em" 
    className={className}
    style={{ 
      verticalAlign: 'middle', 
      marginLeft: '0.3em', 
      marginBottom: '0.15em',
      flexShrink: 0
    }}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/>
    <text x="12" y="19" textAnchor="middle" fontWeight="bold" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="21">$</text>
  </svg>
);