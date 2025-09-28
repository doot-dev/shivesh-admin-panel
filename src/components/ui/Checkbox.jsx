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
      backgroundColor: checked ? 'var(--color-primary)' : 'transparent',
      borderColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
      color: 'white'
    },
    success: {
      backgroundColor: checked ? 'var(--color-success)' : 'transparent',
      borderColor: checked ? 'var(--color-success)' : 'var(--color-border)',
      color: 'white'
    },
    error: {
      backgroundColor: checked ? 'var(--color-error)' : 'transparent',
      borderColor: checked ? 'var(--color-error)' : 'var(--color-border)',
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
        flex items-center cursor-pointer select-none
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
            ${checked || indeterminate ? 'border-transparent' : 'hover:border-opacity-75'}
          `}
          style={colorStyles[color]}
        >
          {checked && (
            <Icon 
              name={ICON_NAMES.CHECK} 
              size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} 
              color="white"
            />
          )}
          {indeterminate && !checked && (
            <div 
              className="w-2 h-0.5 rounded"
              style={{ backgroundColor: 'white' }}
            />
          )}
        </div>
      </div>
      {label && (
        <span 
          className={`
            ml-3 text-sm font-medium
            ${disabled ? 'text-gray-400' : ''}
          `}
          style={{ color: disabled ? 'var(--color-disabled)' : 'var(--color-text-primary)' }}
        >
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;