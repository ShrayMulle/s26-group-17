import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export default function Button({ 
  children, 
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap text-center rounded-md border font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  
  const variants = {
    primary: "border-sky-400/40 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm hover:from-sky-500 hover:to-cyan-600 hover:shadow focus-visible:ring-sky-300",
    secondary: "border-sky-200/80 bg-sky-100/85 text-sky-800 shadow-sm hover:bg-sky-200/85 hover:text-sky-900 focus-visible:ring-sky-300",
    danger: "border-rose-300/70 bg-rose-500 text-white shadow-sm hover:bg-rose-600 focus-visible:ring-rose-300"
  };

  const sizes = {
    sm: "pl-5 pr-5 py-2 text-sm",
    md: "pl-6 pr-6 py-2",
    lg: "pl-7 pr-7 py-3 text-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}