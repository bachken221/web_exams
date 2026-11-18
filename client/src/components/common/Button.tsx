import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'amber' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-teal-700 hover:bg-teal-800 text-white border border-transparent',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white border border-transparent',
    secondary: 'bg-slate-800 hover:bg-slate-900 text-white border border-transparent',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border border-transparent',
    outline: 'bg-white hover:bg-stone-50 text-slate-700 border border-slate-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

