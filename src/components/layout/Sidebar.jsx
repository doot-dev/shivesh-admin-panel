import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  UserCheck,
  ShoppingCart,
  TrendingUp,
  FileBarChart,
  Settings,
  LogOut,
  TestTube,
  CreditCard,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (itemKey) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const menuItems = [
    { 
      key: 'dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/dashboard' 
    },
    { 
      key: 'users', 
      icon: Users, 
      label: 'Users', 
      path: '/users' 
    },
    { 
      key: 'products', 
      icon: Package, 
      label: 'Product', 
      path: '/products' 
    },
    { 
      key: 'clients', 
      icon: UserCheck, 
      label: 'Client', 
      path: '/clients' 
    },
    { 
      key: 'vendors', 
      icon: ShoppingCart, 
      label: 'Vendor', 
      path: '/vendors' 
    },
    { 
      key: 'leads', 
      icon: TrendingUp, 
      label: 'Leads', 
      path: '/leads' 
    },
    { 
      key: 'projects', 
      icon: FileBarChart, 
      label: 'Project', 
      path: '/projects' 
    },
    {
      key: 'orders',
      icon: ShoppingCart,
      label: 'Orders & Tracks',
      path: '/orders',
      hasSubmenu: true,
      submenu: [
        { label: 'All Orders', path: '/orders/all' },
        { label: 'Pending Orders', path: '/orders/pending' },
        { label: 'Completed Orders', path: '/orders/completed' }
      ]
    },
    { 
      key: 'testing', 
      icon: TestTube, 
      label: 'Cube Testing', 
      path: '/testing' 
    },
    { 
      key: 'billing', 
      icon: CreditCard, 
      label: 'Billing', 
      path: '/billing' 
    },
    { 
      key: 'reports', 
      icon: FileBarChart, 
      label: 'Reports', 
      path: '/reports' 
    },
    { 
      key: 'settings', 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings' 
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
        w-64
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gray-800">SHIVESH</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.key}>
                {item.hasSubmenu ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.key)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${isActive(item.path) 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </div>
                      {expandedItems[item.key] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    {expandedItems[item.key] && (
                      <ul className="mt-2 ml-6 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              className={`
                                block px-3 py-2 text-sm rounded-lg transition-colors
                                ${isActive(subItem.path)
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                                }
                              `}
                              onClick={onClose}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`
                      flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive(item.path) 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    onClick={onClose}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full">
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;