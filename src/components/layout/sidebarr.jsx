import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Icon, ICON_NAMES } from "../icons";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import LogoImg from "../../assets/img/shivesh-logo.png";
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});
  const dispatch = useDispatch();
  const router = useNavigate();
  const toggleExpanded = (itemKey) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };
  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    router.push("/");
  };
  const menuItems = [
    {
      key: "dashboard",
      icon: ICON_NAMES.DASHBOARD,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      key: "users",
      icon: ICON_NAMES.USER,
      label: "Users",
      path: "/users",
    },
    {
      key: "products",
      icon: ICON_NAMES.PRODUCT,
      label: "Product",
      path: "/products",
    },
    {
      key: "clients",
      icon: ICON_NAMES.CLIENT,
      label: "Client",
      path: "/clients",
    },
    {
      key: "vendors",
      icon: ICON_NAMES.VENDOR,
      label: "Vendor",
      path: "/vendors",
    },
    {
      key: "leads",
      icon: ICON_NAMES.LEADS,
      label: "Leads",
      path: "/leads",
    },
    {
      key: "projects",
      icon: ICON_NAMES.PROJECTS,
      label: "Project",
      path: "/projects",
    },
    {
      key: "orders",
      icon: ICON_NAMES.ORDERS,
      label: "Orders & Tracks",
      path: "/orders",
      // hasSubmenu: true,
      // submenu: [
      //   { label: "All Orders", path: "/orders/all" },
      //   { label: "Pending Orders", path: "/orders/pending" },
      //   { label: "Completed Orders", path: "/orders/completed" },
      // ],
    },
    {
      key: "testing",
      icon: ICON_NAMES.CUBE_TESTING,
      label: "Cube Testing",
      path: "/testing",
    },
    {
      key: "billing",
      icon: ICON_NAMES.BILLING,
      label: "Billing",
      path: "/billing",
    },
    {
      key: "reports",
      icon: ICON_NAMES.REPORTS,
      label: "Reports",
      path: "/reports",
    },
    {
      key: "settings",
      icon: ICON_NAMES.SETTINGS,
      label: "Settings",
      path: "/settings",
    },
  ];

  const isActive = (path) => {
    // Special case for products - should be active for /products and /products/:id
    if (path === "/products") {
      return (
        location.pathname === "/products" ||
        location.pathname.startsWith("/products/")
      );
    }

    // Special case for vendors - should be active for /vendors and /vendors/:id
    if (path === "/vendors") {
      return (
        location.pathname === "/vendors" ||
        location.pathname.startsWith("/vendors/")
      );
    }

    if (path === "/leads") {
      return (
        location.pathname === "/leads" ||
        location.pathname.startsWith("/leads/")
      );
    }

    if (path === "/clients") {
      return (
        location.pathname === "/clients" ||
        location.pathname.startsWith("/clients/")
      );
    }

    if (path === "/projects") {
      return (
        location.pathname === "/projects" ||
        location.pathname.startsWith("/projects/")
      );
    }

    if (path === "/orders") {
      return (
        location.pathname === "/orders" ||
        location.pathname.startsWith("/orders/")
      );
    }

    // Default exact match for other paths
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#00000059] bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-[100vh] overflow-y-auto md:h-[calc(100vh-100px)] bg-white border-r border-t border-primary z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:z-auto md:w-64 lg:w-52
        xl:w-64
      `}
      >
        <div className="flex items-center md:hidden justify-center h-[65px] xl:h-[100px] border-b border-primary">
          <img src={LogoImg} alt="Logo" className="h-12 xl:h-20" />
        </div>

        {/* Desktop logo */}
        {/* <div className="hidden md:flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <img src={LogoImg} alt="Logo" className="h-10 w-10 object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-primary tracking-wide">
              SHIVESH
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              Group of Companies
            </span>
          </div>
        </div> */}

        {/* Navigation */}
        <nav className="flex-1  py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.key}>
                {item.hasSubmenu ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.key)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${
                          isActive(item.path)
                            ? "bg-primary-light text-blue-700 border-l-4 border-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon name={item.icon} size={18} />
                        <span>{item.label}</span>
                      </div>
                      {expandedItems[item.key] ? (
                        <Icon name={ICON_NAMES.CHEVRON_DOWN} size={16} />
                      ) : (
                        <Icon name={ICON_NAMES.CHEVRON_RIGHT} size={16} />
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
                                ${
                                  isActive(subItem.path)
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-100"
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
                      flex items-center space-x-3 px-6 py-2 h-[48px] text-sm font-medium  transition-colors
                      ${
                        isActive(item.path)
                          ? "bg-primary-light text-primary border-l-4 border-primary"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                    onClick={onClose}
                  >
                    <Icon
                      name={item.icon}
                      size={24}
                      color={
                        isActive(item.path) ? "text-primary" : "text-black"
                      }
                    />
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary-light rounded-lg transition-colors w-full"
          >
            <Icon name={ICON_NAMES.LOG_OUT} size={18} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
