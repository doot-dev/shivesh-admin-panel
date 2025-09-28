import { useState, forwardRef } from 'react';
import { Icon, ICON_NAMES } from '../icons';

const Input = forwardRef(({
  type = 'text',
  value = '',
  onChange,
  placeholder = '',
  disabled = false,
  error = false,
  errorMessage = '',
  label = '',
  required = false,
  className = '',
  inputClassName = '',
  leftIcon,
  rightIcon,
  onRightIconClick,
  size = 'md',
  width = 'full',
  maxLength,
  minLength,
  pattern,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  id,
  name,
  backgroundColor = null, // null means transparent, 'input-bg' uses theme color, or any custom color
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const widthClasses = {
    auto: 'w-auto',
    full: 'w-full',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '2/3': 'w-2/3',
    '1/4': 'w-1/4',
    '3/4': 'w-3/4'
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (event) => {
    if (onChange) {
      onChange(event);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={`${widthClasses[width]} ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {label}
          {required && (
            <span className="ml-1" style={{ color: 'var(--color-error)' }}>*</span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon 
              name={leftIcon} 
              size={16} 
              color="var(--color-text-secondary)" 
            />
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          id={id}
          name={name}
          className={`
            block w-full border rounded-lg transition-all duration-200
            ${sizeClasses[size]}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || type === 'password' ? 'pr-10' : ''}
            ${disabled ? 'cursor-not-allowed' : ''}
            ${error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : isFocused 
                ? 'ring-2 ring-primary border-transparent' 
                : 'border-border hover:border-opacity-75'
            }
            focus:outline-none
            ${inputClassName}
          `}
          style={{
            borderColor: error 
              ? 'var(--color-error)' 
              : isFocused 
                ? 'transparent'
                : 'var(--color-border)',
            color: 'var(--color-text-primary)',
            backgroundColor: disabled 
              ? 'var(--color-background)'
              : backgroundColor === 'input-bg'
                ? 'var(--color-input-bg)'
                : backgroundColor === null || backgroundColor === 'transparent'
                  ? 'transparent'
                  : backgroundColor || 'white'
          }}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {(rightIcon || type === 'password') && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {type === 'password' ? (
              <button
                type="button"
                onClick={handlePasswordToggle}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                <Icon 
                  name={showPassword ? ICON_NAMES.EYE_OFF : ICON_NAMES.EYE} 
                  size={16} 
                  color="var(--color-text-secondary)" 
                />
              </button>
            ) : rightIcon ? (
              <button
                type="button"
                onClick={onRightIconClick}
                className={onRightIconClick ? 'cursor-pointer' : 'cursor-default'}
                tabIndex={onRightIconClick ? 0 : -1}
              >
                <Icon 
                  name={rightIcon} 
                  size={16} 
                  color="var(--color-text-secondary)" 
                />
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && errorMessage && (
        <p 
          className="mt-1 text-sm"
          style={{ color: 'var(--color-error)' }}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;