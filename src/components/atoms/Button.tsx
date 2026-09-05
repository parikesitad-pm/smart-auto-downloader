import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gemini';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
      md: 'h-9 px-4 text-sm gap-2 rounded-xl',
      lg: 'h-11 px-6 text-base gap-2.5 rounded-xl',
      icon: 'h-9 w-9 p-0 rounded-xl justify-center',
    };

    const variantClasses = {
      primary:
        'bg-primary text-primary-foreground hover:opacity-90 shadow-sm shadow-primary/25 active:scale-[0.98]',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 active:scale-[0.98]',
      outline:
        'border border-border bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
      ghost:
        'hover:bg-accent/60 hover:text-accent-foreground text-muted-foreground active:scale-[0.98]',
      destructive:
        'bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm active:scale-[0.98]',
      gemini:
        'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 hover:brightness-110 active:scale-[0.98]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
