import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'edition-free' | 'edition-pro' | 'success' | 'warning' | 'error' | 'gemini';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const variantClasses = {
    default: 'bg-secondary text-secondary-foreground border border-border/50',
    outline: 'border border-border text-foreground bg-transparent',
    'edition-free':
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold tracking-wide',
    'edition-pro':
      'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 font-bold shadow-sm shadow-purple-500/10 tracking-wide',
    gemini:
      'bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-pink-600/15 border border-purple-400/30 text-purple-600 dark:text-purple-300 font-semibold',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    error: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
