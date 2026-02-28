import { useState, useRef, useEffect } from 'react';
import { Icon, ICON_NAMES } from '../icons';

const Dropdown = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select...',
  className = '',
  width = 'auto',
  height = '50px',
  disabled = false,
  error = false,
  searchable = false,
  maxHeight = '200px',
  position = 'bottom',
  backgroundColor = null // null means white/default, 'input-bg' uses theme color, or any custom color
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter((option) =>
      option?.label
        ?.toString()
        .toLowerCase()
        .includes(searchTerm?.toLowerCase() || "")
    )
    : options;

  // Get selected option
  const selectedOption = options.find(
    (option) => option?.value === value
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative rounded-lg inline-block ${className}`}
      style={{ width }}
    >
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border rounded-lg transition-all duration-200
          flex items-center justify-between
          ${disabled
            ? 'cursor-not-allowed'
            : 'hover:opacity-90 cursor-pointer'
          }
          ${error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-border focus:ring-primary focus:border-transparent'
          }
          ${isOpen ? 'ring-2 ring-primary border-transparent' : ''}
        `}
        style={{
          height,
          borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
          color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          backgroundColor: disabled
            ? 'var(--color-background)'
            : backgroundColor === 'input-bg'
              ? 'var(--color-input-bg)'
              : backgroundColor === null || backgroundColor === 'transparent'
                ? 'white'
                : backgroundColor || 'white'
        }}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center ml-2">
          <Icon
            name={ICON_NAMES.CHEVRON_DOWN}
            size={16}
            color="var(--color-text-secondary)"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute z-50 w-full bg-white border border-border rounded-lg shadow-lg
            ${position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
          `}
          style={{
            borderColor: 'var(--color-border)',
            maxHeight
          }}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-border">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name={ICON_NAMES.SEARCH} size={14} color="var(--color-text-secondary)" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-secondary text-center">
                {searchable && searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value || index}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full px-3 py-2 text-left text-sm transition-colors duration-150
                    hover:bg-background-hover
                    ${value === option.value
                      ? 'text-primary font-medium'
                      : 'text-text-primary'
                    }
                  `}
                  style={{
                    backgroundColor: value === option.value ? 'var(--color-primary-light)' : 'transparent',
                    color: value === option.value ? 'var(--color-primary)' : 'var(--color-text-primary)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{option.label}</span>
                    {/* {value === option.value && (
                      <Icon 
                        name={ICON_NAMES.CHECK} 
                        size={14} 
                        color="var(--color-primary)" 
                      />
                    )} */}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;