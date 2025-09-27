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
  
  // Convert common colors to CSS filters
  const colorMap = {
    // Blue colors
    '#3B82F6': 'brightness(0) saturate(100%) invert(44%) sepia(78%) saturate(2067%) hue-rotate(213deg) brightness(101%) contrast(101%)',
    '#1E3A8A': 'brightness(0) saturate(100%) invert(12%) sepia(87%) saturate(4466%) hue-rotate(230deg) brightness(89%) contrast(101%)',
    
    // Green colors
    '#059669': 'brightness(0) saturate(100%) invert(29%) sepia(93%) saturate(1840%) hue-rotate(146deg) brightness(96%) contrast(105%)',
    '#16A34A': 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)',
    
    // Red colors
    '#DC2626': 'brightness(0) saturate(100%) invert(16%) sepia(100%) saturate(2444%) hue-rotate(342deg) brightness(95%) contrast(94%)',
    '#EF4444': 'brightness(0) saturate(100%) invert(32%) sepia(76%) saturate(3461%) hue-rotate(340deg) brightness(97%) contrast(94%)',
    
    // Yellow/Orange colors
    '#F59E0B': 'brightness(0) saturate(100%) invert(69%) sepia(58%) saturate(2618%) hue-rotate(21deg) brightness(101%) contrast(101%)',
    '#FBBF24': 'brightness(0) saturate(100%) invert(84%) sepia(39%) saturate(1386%) hue-rotate(13deg) brightness(105%) contrast(96%)',
    
    // Purple colors
    '#8B5CF6': 'brightness(0) saturate(100%) invert(49%) sepia(89%) saturate(2180%) hue-rotate(244deg) brightness(102%) contrast(97%)',
    
    // Gray colors
    '#9CA3AF': 'brightness(0) saturate(100%) invert(70%) sepia(11%) saturate(360%) hue-rotate(185deg) brightness(92%) contrast(87%)',
    '#6B7280': 'brightness(0) saturate(100%) invert(52%) sepia(18%) saturate(398%) hue-rotate(185deg) brightness(90%) contrast(88%)',
    '#374151': 'brightness(0) saturate(100%) invert(26%) sepia(15%) saturate(766%) hue-rotate(185deg) brightness(94%) contrast(87%)'
  };
  
  return colorMap[color] || 'brightness(0) saturate(100%)';
};

export default Icon;
