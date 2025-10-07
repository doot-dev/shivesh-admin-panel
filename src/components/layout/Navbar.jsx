import { useState } from 'react';
import { Icon, ICON_NAMES } from '../icons';
import Logo from "../../assets/img/shivesh-logo.png";
import { useUser } from '../../context/UserContext';
const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { getUserName, getUserRole } = useUser();

  return (
    <nav className="bg-white border-b border-primary h-[100px] px-4 inline-flex justify-center w-full  md:px-6">
      <div className="flex items-center justify-between w-full">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
          >
            {isSidebarOpen ? <Icon name={ICON_NAMES.X} size={20} /> : <Icon name={ICON_NAMES.MENU} size={20} />}
          </button>
          
          {/* Search bar */}
          {/* <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div> */}
          <div>
            <img src={Logo} alt="Logo" className="h-20" />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
            <Icon name={ICON_NAMES.NOTIFICATION} size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
            >
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="h-8 w-8 rounded-full"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">{getUserName()}</p>
                <p className="text-xs text-gray-500">{getUserRole()}</p>
              </div>
            </button>

            {/* Profile dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Your Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      {/* <div className="mt-3 md:hidden">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div> */}
    </nav>
  );
};

export default Navbar;