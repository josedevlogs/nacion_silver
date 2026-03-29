import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-base font-semibold text-neutral-700 mb-2">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 text-base
            bg-white border-2 rounded-lg
            ${error ? 'border-error-500' : 'border-neutral-300'}
            focus:outline-none focus:ring-4
            ${error ? 'focus:ring-red-100' : 'focus:ring-primary-100'}
            ${error ? 'focus:border-error-500' : 'focus:border-primary-500'}
            disabled:bg-neutral-100 disabled:cursor-not-allowed
            transition-all duration-200
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-error-500">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-2 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
