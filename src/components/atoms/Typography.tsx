import React from 'react';

export const Heading: React.FC<React.HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 }> = ({
  level = 1,
  className = '',
  children,
  ...props
}) => {
  const classes = {
    1: 'text-2xl font-bold tracking-tight text-foreground',
    2: 'text-xl font-bold tracking-tight text-foreground',
    3: 'text-lg font-semibold text-foreground',
    4: 'text-base font-semibold text-foreground',
  };

  if (level === 1) return <h1 className={`${classes[1]} ${className}`} {...props}>{children}</h1>;
  if (level === 2) return <h2 className={`${classes[2]} ${className}`} {...props}>{children}</h2>;
  if (level === 3) return <h3 className={`${classes[3]} ${className}`} {...props}>{children}</h3>;
  return <h4 className={`${classes[4]} ${className}`} {...props}>{children}</h4>;
};

export const Text: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p className={`text-sm text-foreground/90 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const Muted: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <span className={`text-xs text-muted-foreground ${className}`} {...props}>
      {children}
    </span>
  );
};

export const Monospace: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <code className={`font-mono text-xs px-1.5 py-0.5 rounded bg-muted text-foreground border border-border/50 ${className}`} {...props}>
      {children}
    </code>
  );
};
