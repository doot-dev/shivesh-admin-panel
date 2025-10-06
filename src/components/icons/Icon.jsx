import React from 'react';

// Import all your SVG icons as URLs
import DashboardIcon from '../../assets/icons/dashboard.svg?url';
import UserIcon from '../../assets/icons/user.svg?url';
import ProductIcon from '../../assets/icons/product.svg?url';
import ClientIcon from '../../assets/icons/client.svg?url';
import VendorIcon from '../../assets/icons/vendor.svg?url';
import LeadsIcon from '../../assets/icons/leads.svg?url';
import ProjectsIcon from '../../assets/icons/projects.svg?url';
import OrderAndTrucksIcon from '../../assets/icons/orderandtrucks.svg?url';
import CubeTestingIcon from '../../assets/icons/cubetesting.svg?url';
import BillingIcon from '../../assets/icons/billing.svg?url';
import ReportsIcon from '../../assets/icons/reports.svg?url';
import SettingsIcon from '../../assets/icons/settings.svg?url';
import LogOutIcon from '../../assets/icons/log-out.svg?url';
import NotificationIcon from '../../assets/icons/Notification.svg?url';
import AddNewUserIcon from "../../assets/icons/addNewUser.svg?url";
import UserDetailIcon from "../../assets/icons/userDetails.svg?url";
import EditDetailIcon from "../../assets/icons/editUser.svg?url";
import TickIcon from "../../assets/icons/tick.svg?url";
import ProductModalIcon from "../../assets/icons/productModal.svg?url";
import DeleteIcon from "../../assets/icons/delete.svg?url";

const Icon = ({ 
  name, 
  size = 24, 
  color = 'currentColor', 
  className = '', 
  ...props 
}) => {
  const iconMap = {
    // Main navigation icons matching your sidebar
    'dashboard': DashboardIcon,
    'layout-dashboard': DashboardIcon,
    'users': UserIcon,
    'user': UserIcon,
    'package': ProductIcon,
    'product': ProductIcon,
    'client': ClientIcon,
    'id-card-lanyard': ClientIcon,
    'handshake': ClientIcon,
    'vendor': VendorIcon,
    'truck': VendorIcon,
    'leads': LeadsIcon,
    'chart-line': LeadsIcon,
    'projects': ProjectsIcon,
    'briefcase-business': ProjectsIcon,
    'orders': OrderAndTrucksIcon,
    'orderandtrucks': OrderAndTrucksIcon,
    'cubetesting': CubeTestingIcon,
    'funnel': CubeTestingIcon,
    'billing': BillingIcon,
    'receipt-text': BillingIcon,
    'reports': ReportsIcon,
    'file-chart-column-increasing': ReportsIcon,
    'settings': SettingsIcon,
    'log-out': LogOutIcon,
    'notification': NotificationIcon,
    'add-new-user': AddNewUserIcon,
    'user-details': UserDetailIcon,
    'edit-user': EditDetailIcon,
    'tick': TickIcon,
    'product-modal': ProductModalIcon,
    'delete': DeleteIcon,

    // UI icons - using inline SVG for common UI elements
    'search': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m21 21-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'plus': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 5v14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'edit': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'trash-2': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="M3 6h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="10" x2="10" y1="11" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="14" x2="14" y1="11" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'eye': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'eye-off': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="2" x2="22" y1="2" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'menu': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <line x1="4" x2="20" y1="6" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="4" x2="20" y1="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="4" x2="20" y1="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'x': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="m18 6-12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m6 6 12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'chevron-down': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="m6 9 6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'chevron-right': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="m9 18 6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'chevron-left': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="m15 18-6-6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'chevron-up': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="m18 15-6-6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'chevron-up-down': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="m7 15 5 5 5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m7 9 5-5 5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'inbox': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <polyline points="22,12 16,12 14,15 10,15 8,12 2,12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'check': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="m9 12 2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'dollar-sign': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <line x1="12" x2="12" y1="2" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'trending-up': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="16,7 22,7 22,13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };

  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  // If it's an imported SVG URL
  if (typeof IconComponent === 'string') {
    return (
      <img 
        src={IconComponent} 
        alt={name}
        width={size}
        height={size}
        className={className}
        style={{ 
          filter: color !== 'currentColor' ? `brightness(0) saturate(100%) ${getColorFilter(color)}` : undefined,
          ...props.style 
        }}
        {...props}
      />
    );
  }

  // If it's inline SVG JSX
  return IconComponent;
};

// Helper function to create CSS filter for colors
const getColorFilter = (color) => {
  if (color === 'currentColor' || !color) return '';
  
  // Convert your custom colors and common colors to CSS filters
  const colorMap = {
    // CSS custom properties support
    'var(--color-primary)': 'brightness(0) saturate(100%) invert(12%) sepia(87%) saturate(4466%) hue-rotate(230deg) brightness(89%) contrast(101%)',
    'var(--color-primary-second)': 'brightness(0) saturate(100%) invert(8%) sepia(87%) saturate(4466%) hue-rotate(230deg) brightness(75%) contrast(101%)',
    'var(--color-primary-light)': 'brightness(0) saturate(100%) invert(95%) sepia(24%) saturate(547%) hue-rotate(213deg) brightness(104%) contrast(92%)',
    'var(--color-success)': 'brightness(0) saturate(100%) invert(29%) sepia(93%) saturate(1840%) hue-rotate(120deg) brightness(96%) contrast(105%)',
    'var(--color-warning)': 'brightness(0) saturate(100%) invert(69%) sepia(58%) saturate(2618%) hue-rotate(21deg) brightness(101%) contrast(101%)',
    'var(--color-error)': 'brightness(0) saturate(100%) invert(16%) sepia(100%) saturate(2444%) hue-rotate(342deg) brightness(95%) contrast(94%)',
    'var(--color-text-primary)': 'brightness(0) saturate(100%) invert(26%) sepia(15%) saturate(766%) hue-rotate(185deg) brightness(94%) contrast(87%)',
    'var(--color-text-secondary)': 'brightness(0) saturate(100%) invert(52%) sepia(18%) saturate(398%) hue-rotate(185deg) brightness(90%) contrast(88%)',
    'var(--color-border)': 'brightness(0) saturate(100%) invert(58%) sepia(74%) saturate(1547%) hue-rotate(213deg) brightness(104%) contrast(92%)',
    
    // Your custom colors (hex values)
    '#1e3a8a': 'brightness(0) saturate(100%) invert(12%) sepia(87%) saturate(4466%) hue-rotate(230deg) brightness(89%) contrast(101%)', // primary
    '#162e6b': 'brightness(0) saturate(100%) invert(8%) sepia(87%) saturate(4466%) hue-rotate(230deg) brightness(75%) contrast(101%)', // primary-second
    '#9bb3f4': 'brightness(0) saturate(100%) invert(76%) sepia(24%) saturate(1547%) hue-rotate(213deg) brightness(104%) contrast(92%)', // primary-bg-alt
    '#e5ecff': 'brightness(0) saturate(100%) invert(95%) sepia(24%) saturate(547%) hue-rotate(213deg) brightness(104%) contrast(92%)', // primary-light
    '#6D8FEF': 'brightness(0) saturate(100%) invert(58%) sepia(74%) saturate(1547%) hue-rotate(213deg) brightness(104%) contrast(92%)', // border
    '#2e7d32': 'brightness(0) saturate(100%) invert(29%) sepia(93%) saturate(1840%) hue-rotate(120deg) brightness(96%) contrast(105%)', // success
    '#f9a825': 'brightness(0) saturate(100%) invert(69%) sepia(58%) saturate(2618%) hue-rotate(21deg) brightness(101%) contrast(101%)', // warning
    '#d32f2f': 'brightness(0) saturate(100%) invert(16%) sepia(100%) saturate(2444%) hue-rotate(342deg) brightness(95%) contrast(94%)', // error
    '#3a3a3a': 'brightness(0) saturate(100%) invert(26%) sepia(15%) saturate(766%) hue-rotate(185deg) brightness(94%) contrast(87%)', // text-primary
    '#757575': 'brightness(0) saturate(100%) invert(52%) sepia(18%) saturate(398%) hue-rotate(185deg) brightness(90%) contrast(88%)', // text-secondary
    '#c8c8c8': 'brightness(0) saturate(100%) invert(82%) sepia(4%) saturate(360%) hue-rotate(185deg) brightness(92%) contrast(87%)', // stroke-alt/bg-alt2
    '#9ca3af': 'brightness(0) saturate(100%) invert(70%) sepia(11%) saturate(360%) hue-rotate(185deg) brightness(92%) contrast(87%)', // disabled
    
    // Common colors for backward compatibility
    '#3B82F6': 'brightness(0) saturate(100%) invert(44%) sepia(78%) saturate(2067%) hue-rotate(213deg) brightness(101%) contrast(101%)',
    '#059669': 'brightness(0) saturate(100%) invert(29%) sepia(93%) saturate(1840%) hue-rotate(146deg) brightness(96%) contrast(105%)',
    '#DC2626': 'brightness(0) saturate(100%) invert(16%) sepia(100%) saturate(2444%) hue-rotate(342deg) brightness(95%) contrast(94%)',
    '#EF4444': 'brightness(0) saturate(100%) invert(32%) sepia(76%) saturate(3461%) hue-rotate(340deg) brightness(97%) contrast(94%)',
    '#F59E0B': 'brightness(0) saturate(100%) invert(69%) sepia(58%) saturate(2618%) hue-rotate(21deg) brightness(101%) contrast(101%)',
    '#8B5CF6': 'brightness(0) saturate(100%) invert(49%) sepia(89%) saturate(2180%) hue-rotate(244deg) brightness(102%) contrast(97%)',
    '#6B7280': 'brightness(0) saturate(100%) invert(52%) sepia(18%) saturate(398%) hue-rotate(185deg) brightness(90%) contrast(88%)',
    '#374151': 'brightness(0) saturate(100%) invert(26%) sepia(15%) saturate(766%) hue-rotate(185deg) brightness(94%) contrast(87%)'
  };
  
  return colorMap[color] || 'brightness(0) saturate(100%)';
};

export default Icon;
