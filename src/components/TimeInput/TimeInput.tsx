import React, { useCallback, forwardRef } from 'react';
import './TimeInput.scss';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  'aria-label'?: string;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(({
  value,
  onChange,
  onBlur,
  onKeyDown,
  className = '',
  ...rest
}, ref) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="time-input">
      <input
        ref={ref}
        type="time"
        className={`time-input__field ${className}`}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        required
        {...rest}
      />
    </div>
  );
});

TimeInput.displayName = 'TimeInput';
