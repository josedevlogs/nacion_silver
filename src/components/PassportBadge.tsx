import { Award } from 'lucide-react';
import type { PassportLevel } from '../lib/database.types';

interface PassportBadgeProps {
  level: PassportLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const levelConfig = {
  silver: {
    name: 'Silver',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    iconColor: 'text-gray-600',
  },
  residente_silver: {
    name: 'Residente Silver',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    iconColor: 'text-blue-600',
  },
  ciudadano_silver: {
    name: 'Ciudadano Silver',
    color: 'bg-green-100 text-green-800 border-green-300',
    iconColor: 'text-green-600',
  },
  embajador_silver: {
    name: 'Embajador Silver',
    color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border-amber-300',
    iconColor: 'text-amber-700',
  },
};

export function PassportBadge({ level, size = 'md', showIcon = true }: PassportBadgeProps) {
  const config = levelConfig[level];

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-full border-2 ${config.color} ${sizeStyles[size]}`}
    >
      {showIcon && <Award size={iconSizes[size]} className={config.iconColor} />}
      {config.name}
    </span>
  );
}
