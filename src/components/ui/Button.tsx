import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-200 active:bg-primary-800',
      secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-200 active:bg-secondary-800',
      outline: 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-200',
      ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 active:bg-red-800',
    };

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm gap-2',
      md: 'px-6 py-3 text-base gap-2',
      lg: 'px-8 py-4 text-lg gap-3',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
