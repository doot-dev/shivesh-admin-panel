import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  maxHeight = '',
  headerIcon = ICON_NAMES.USER,
  showHeaderIcon = true,
  hideHeader = false
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

  // Phones: a bottom sheet (thumb-reachable, full width). Tablets and up: a
  // centred card. Either way the body scrolls inside, so long forms never push
  // the footer buttons off screen.
  // Portalled to <body>: the page content animates in with a transform, and a
  // transformed ancestor would trap a fixed overlay inside the content pane.
  return createPortal(
    <div
      className="sv-fade fixed inset-0 z-[60] flex items-end justify-center bg-primary-second/55 sm:items-center sm:p-4"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`
          sv-pop relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[24px] bg-white text-left shadow-[0_30px_80px_rgba(8,18,55,.45)] outline-none
          sm:max-h-[88dvh] sm:rounded-[22px]
          ${maxWidth ? '' : sizeClasses[size] || sizeClasses.md}
          ${className}
        `}
        style={{ maxWidth: maxWidth || undefined, maxHeight: maxHeight || undefined }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab handle — phones only, signals the sheet */}
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
          <span className="h-1.5 w-10 rounded-full bg-primary-light" />
        </div>

        {!hideHeader && (title || showCloseButton) && (
          <div className={`flex shrink-0 items-center justify-between gap-3 border-b border-primary-light px-5 py-4 sm:px-6 ${headerClassName}`}>
            <div className="flex min-w-0 items-center gap-3">
              {showHeaderIcon && headerIcon && headerIcon !== 'none' && (
                <span className="hidden shrink-0 sm:block"><Icon name={headerIcon} size={48} /></span>
              )}
              {title && <h3 className="truncate text-lg font-semibold text-primary-second">{title}</h3>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-background-hover"
                aria-label="Close"
              >
                <Icon name={ICON_NAMES.X} size={20} color="var(--color-text-secondary)" />
              </button>
            )}
          </div>
        )}

        <div className={`min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 ${bodyClassName}`}>
          {children}
        </div>

        {footer && (
          <div className={`flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-primary-light bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;