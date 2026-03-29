import { ReactNode } from 'react';
import type { PassportLevel } from '../../lib/database.types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral' | PassportLevel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ children, variant = 'primary', size = 'md', className = '' }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    silver: 'bg-gray-100 text-gray-700 border-gray-300',
    residente_silver: 'bg-blue-100 text-blue-700 border-blue-300',
    ciudadano_silver: 'bg-green-100 text-green-700 border-green-300',
    embajador_silver: 'bg-amber-100 text-amber-700 border-amber-300',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold rounded-full border-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
