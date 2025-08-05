import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add any additional props here
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', value, ...props }, ref) => {
    // Convert number values to string for display
    const displayValue = typeof value === 'number' ? value.toString() : value;
    
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        value={displayValue}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input }; 
