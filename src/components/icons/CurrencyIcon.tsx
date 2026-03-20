import React from 'react';

export const CurrencyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
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
    <circle cx="50" cy="50" r="45" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="6"/>
    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="3"/>
    <text 
      x="50" 
      y="63" 
      fontFamily="Arial, sans-serif" 
      fontSize="42" 
      fontWeight="bold" 
      fill="currentColor" 
      textAnchor="middle"
    >
      $
    </text>
  </svg>
);
