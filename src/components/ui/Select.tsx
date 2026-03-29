import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-base font-semibold text-neutral-700 mb-2">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-3 text-base appearance-none
              bg-white border-2 rounded-lg
              ${error ? 'border-error-500' : 'border-neutral-300'}
              focus:outline-none focus:ring-4
              ${error ? 'focus:ring-red-100' : 'focus:ring-primary-100'}
              ${error ? 'focus:border-error-500' : 'focus:border-primary-500'}
              disabled:bg-neutral-100 disabled:cursor-not-allowed
              transition-all duration-200
              pr-10
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 pointer-events-none"
            size={20}
          />
        </div>
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

Select.displayName = 'Select';
