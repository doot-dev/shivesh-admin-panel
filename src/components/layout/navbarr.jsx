import { useState } from 'react';
import { Icon, ICON_NAMES } from '../icons';
import Logo from "../../assets/img/shivesh-logo.png";
import { useSelector } from "react-redux";
import UserIcon from "../../assets/img/profile.png"
// import { useUser } from '../../context/UserContext';
const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // const { getUserName, getUserRole } = useUser();
  const user = useSelector((state) => state.auth.user);
  
  return (
    <nav className="bg-white border-b border-primary h-[65px] xl:h-[100px] px-4 inline-flex justify-center w-full  md:px-6">
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
          <div className='hidden md:block' >
            <img src={Logo} alt="Logo" className="h-20" />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
            <Icon name={ICON_NAMES.NOTIFICATION} size={30} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
            >
              <img
                src={UserIcon}
                alt="Profile"
                className="h-10 w-10 rounded-full"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </button>

            {/* Profile dropdown menu */}
            {/* {isProfileOpen && (
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
            )} */}
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