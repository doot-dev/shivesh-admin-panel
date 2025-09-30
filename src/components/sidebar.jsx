import React from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/" },
  { name: "User", path: "/users" },
  { name: "Product", path: "" },
  { name: "Client", path: "" },
  { name: "Vendor", path: "" },
  { name: "Leads", path: "" },
  { name: "Project", path: "" },
  { name: "Orders & Trucks", path: "" },
  { name: "Cube Testing", path: "" },
  { name: "Billing", path: "" },
  { name: "Reports", path: "" },
  { name: "Settings", path: "" },
];

export default function Sidebar() {
  return (
    <div className="lg:w-[240px] h-[calc(100vh-100px)] lg:py-4 border-r border-primary bg-white">
      <nav className="flex flex-col mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-10 py-3 text-sm font-medium hover:bg-blue-100 transition leading-[22.5px] h-[48px] font-poppins 
              ${
                isActive
                  ? "bg-primary-light text-primary border-primary border-l-4 "
                  : " text-text-primary  hover:border-primary hover:bg-blue-100"
              }`
            }
          > 
            {item.name}
          </NavLink>
        ))}
        <div className="h-[88px] border-b border-black w-[80%] mx-auto" ></div>
      </nav>
      <div className="h-[48px] text-text-primary leading-[22.5px] font-medium px-10 py-10 ">Log out</div>

    </div>
  );
}
