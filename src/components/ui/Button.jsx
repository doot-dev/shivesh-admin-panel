import React from 'react';
import { Icon } from '../icons';

const Button = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  
  // Size variants
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl'
  
  // Color variants
  variant = 'primary', // 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost', 'outline'
  
  // Custom styling
  width,
  height,
  className = '',
  
  // Icon props
  leftIcon,
  rightIcon,
  iconSize = 16,
  
  // Border and styling
  rounded = 'lg', // 'none', 'sm', 'md', 'lg', 'xl', 'full'
  border = true,
  
  // Custom colors (overrides variant)
  backgroundColor,
  textColor,
  borderColor,
  hoverBackgroundColor,
  hoverTextColor,
  hoverBorderColor,
  
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  // Variant classes using your custom colors
  const variantClasses = {
    primary: 'bg-primary text-text-inverse border-primary hover:bg-primary-second hover:border-primary-second focus:ring-primary',
    secondary: 'bg-stroke-alt text-text-primary border-stroke-alt hover:bg-bg-alt2 hover:border-bg-alt2 focus:ring-stroke-alt',
    success: 'bg-success text-text-inverse border-success hover:opacity-90 focus:ring-success',
    danger: 'bg-error text-text-inverse border-error hover:opacity-90 focus:ring-error',
    warning: 'bg-warning text-text-inverse border-warning hover:opacity-90 focus:ring-warning',
    info: 'bg-primary-bg-alt text-text-primary border-primary-bg-alt hover:bg-primary-light hover:border-primary-light focus:ring-primary-bg-alt',
    ghost: 'bg-transparent text-text-primary border-transparent hover:bg-primary-light hover:text-text-primary focus:ring-primary',
    outline: 'bg-transparent text-primary border-border hover:bg-primary-light hover:text-primary focus:ring-primary',
    disabled: 'bg-disabled text-text-inverse border-disabled cursor-not-allowed'
  };

  // Rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  // Build classes
  const baseClasses = [
    'inline-flex items-center justify-center font-medium transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
  ];

  const classes = [
    ...baseClasses,
    sizeClasses[size],
    !backgroundColor && !textColor && variantClasses[variant],
    roundedClasses[rounded],
    border && !borderColor && 'border',
    className
  ].filter(Boolean).join(' ');

  // Custom inline styles
  const customStyles = {
    ...(width && { width }),
    ...(height && { height }),
    ...(backgroundColor && { backgroundColor }),
    ...(textColor && { color: textColor }),
    ...(borderColor && { borderColor }),
    ...props.style
  };

  // Custom hover styles (if provided)
  const hoverStyles = {};
  if (hoverBackgroundColor) hoverStyles['--hover-bg'] = hoverBackgroundColor;
  if (hoverTextColor) hoverStyles['--hover-text'] = hoverTextColor;
  if (hoverBorderColor) hoverStyles['--hover-border'] = hoverBorderColor;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      style={{ ...customStyles, ...hoverStyles }}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Left icon */}
      {leftIcon && !loading && (
        <Icon 
          name={leftIcon} 
          size={iconSize} 
          className={children ? 'mr-2' : ''} 
        />
      )}

      {/* Button content */}
      {children}

      {/* Right icon */}
      {rightIcon && !loading && (
        <Icon 
          name={rightIcon} 
          size={iconSize} 
          className={children ? 'ml-2' : ''} 
        />
      )}
    </button>
  );
};

export default Button;