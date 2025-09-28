import { useEffect, useRef } from 'react';
import { Icon, ICON_NAMES } from '../icons';

const Modal = ({
  isOpen = false,
  onClose,
  title = '',
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  footer,
  maxWidth = '',
  maxHeight = '90vh',
  headerIcon = ICON_NAMES.USER,
  showHeaderIcon = true
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Size variants
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full'
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event) => {
    if (closeOnOverlay && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick}
    >
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`
            relative transform overflow-hidden rounded-[18px] bg-white text-left shadow-xl transition-all
            w-full mx-4 sm:mx-auto sm:my-8
            ${maxWidth ? '' : sizeClasses[size] || sizeClasses.md}
            ${className}
          `}
          style={{ 
            maxWidth: maxWidth || undefined,
            maxHeight 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div 
              className={`
                flex items-center justify-between px-6 py-4 border-b border-[#EAEAEA]
                ${headerClassName}
              `}
             
            >
              <div className="flex items-center space-x-3">
                {showHeaderIcon && (
                //   <div 
                //     className="flex items-center justify-center w-10 h-10 rounded-full"
                //     style={{ backgroundColor: 'var(--color-primary-light)' }}
                //   >
                    <Icon 
                      name={headerIcon} 
                      size={60} 
                     
                    />
                //   </div>
                )}
                {title && (
                  <h3 
                    className="text-lg font-semibold leading-6"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {title}
                  </h3>
                )}
              </div>
              
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <Icon 
                    name={ICON_NAMES.X} 
                    size={20} 
                    color="var(--color-text-secondary)" 
                  />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div 
            className={`px-6 py-4 overflow-y-auto ${bodyClassName}`}
            style={{ maxHeight: 'calc(90vh - 120px)' }}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div 
              className={`
                px-6 py-4 border-t bg-gray-50 flex items-center justify-end space-x-3
                ${footerClassName}
              `}
              style={{ borderColor: 'var(--color-border)' }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;