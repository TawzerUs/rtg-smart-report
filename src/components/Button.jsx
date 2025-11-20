import React from 'react';
import '../index.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a12] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--primary)] text-[#0a0a12] hover:bg-[#00d0e0] shadow-[0_0_15px_var(--primary-glow)] border border-transparent",
    secondary: "bg-[var(--secondary)] text-white hover:bg-[#6000e0] shadow-[0_0_15px_var(--secondary-glow)] border border-transparent",
    glass: "glass-button text-[var(--text-main)] hover:text-[var(--primary)]",
    danger: "bg-[var(--danger)] text-white hover:bg-[#e02020] shadow-[0_0_15px_rgba(255,42,42,0.4)]",
    ghost: "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-glass)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
};

export default Button;
