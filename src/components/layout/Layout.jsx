import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Navbar */}
        <Navbar 
          onToggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
        
        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;