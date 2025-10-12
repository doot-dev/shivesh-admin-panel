import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./navbarr";
import Sidebar from "./sidebarr";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className=" h-screen">
      <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Main content area */}
      <div className="w-full md:flex md:flex-row md:ml-0">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        {/* Main content */}
        <main className=" overflow-x-hidden overflow-y-scroll h-[88vh]  w-full lg:w-[calc(100%-208px)] xl:w-[calc(100%-256px)] px-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
