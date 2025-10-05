import { Icon, ICON_NAMES } from '../icons';

const Checkbox = ({
  checked = false,
  onChange,
  label = '',
  disabled = false,
  className = '',
  size = 'md',
  color = 'primary',
  id,
  name,
  value,
  indeterminate = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const colorStyles = {
    primary: {
      backgroundColor: checked ? 'var(--color-border)' : 'transparent',
      borderColor: checked ? '#3B82F6' : '#D1D5DB',
      color: 'white'
    },
    success: {
      backgroundColor: checked ? 'var(--color-border)' : 'transparent',
      borderColor: checked ? '#10B981' : '#D1D5DB',
      color: 'white'
    },
    error: {
      backgroundColor: checked ? 'var(--color-border)' : 'transparent',
      borderColor: checked ? '#EF4444' : '#D1D5DB',
      color: 'white'
    }
  };

  const handleChange = (event) => {
    if (!disabled && onChange) {
      onChange(event.target.checked, event);
    }
  };

  return (
    <label 
      className={`
        flex items-center cursor-pointer select-none group
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          id={id}
          name={name}
          value={value}
        />
        <div
          className={`
            ${sizeClasses[size]} border-2 rounded flex items-center justify-center
            transition-all duration-200 ease-in-out
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            ${!checked && !disabled ? 'group-hover:border-blue-300' : ''}
            shadow-sm
          `}
          style={{
            backgroundColor: colorStyles[color].backgroundColor,
            borderColor: colorStyles[color].borderColor,
          }}
        >
          {checked && (
            <Icon 
              name={ICON_NAMES.TICK} 
              size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} 
              color="white"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          )}
          {indeterminate && !checked && (
            <div 
              className="w-2.5 h-0.5 rounded-full bg-white"
            />
          )}
        </div>
      </div>
      {label && (
        <span 
          className={`
            ml-3 text-sm font-medium text-gray-700
            ${disabled ? 'text-gray-400' : ''}
            ${!disabled ? 'group-hover:text-gray-900' : ''}
          `}
        >
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;