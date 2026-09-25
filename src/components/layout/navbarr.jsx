import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Menu, Search } from "lucide-react";
import NotificationBell from "./NotificationBell";
import usePermission from "../../hooks/usePermission";
import { initials } from "../../utils/labels";

// First URL segment → the name people know the page by.
const TITLES = {
  dashboard: "Dashboard", orders: "Orders & Tracks", testing: "Cube Testing", projects: "Projects",
  clients: "Clients", vendors: "Vendors", leads: "Leads", billing: "Billing", reports: "Reports",
  products: "Products", subcategories: "Sub-categories", users: "Users", roles: "Roles & Permissions", "client-roles": "Client Roles",
  settings: "Settings",
};

/**
 * Codes people actually type → the page for that record. The panel has no
 * global search API, so this box does exactly what it promises: jump by code.
 */
const JUMPS = [
  [/^ORD-\d{4}-\d+$/i, (c) => `/orders/${c}`],
  [/^BILL-\d{4}-\d+$/i, (c) => `/billing/${c}`],
  [/^CL-[\w-]+$/i, (c) => `/clients/${c}`],
  [/^PRJ?-[\w-]+$/i, (c) => `/projects/${c}`],
];

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const user = useSelector((state) => state.auth.user);
  const { isSuperAdmin } = usePermission();
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const segs = location.pathname.split("/").filter(Boolean);
  const title = TITLES[segs[0]] ?? "";
  const record = segs[1] === "add" ? "New" : segs.length > 1 ? decodeURIComponent(segs[1]) : "";

  const jump = (e) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    const hit = JUMPS.find(([re]) => re.test(c));
    if (!hit) {
      toast.info("Type an order, bill, client or project code — e.g. ORD-2026-0041");
      return;
    }
    navigate(hit[1](c));
    setCode("");
  };

  const name = user?.name ?? user?.userName ?? "";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-primary-light bg-white/85 px-3 backdrop-blur sm:px-5 lg:h-[72px] lg:gap-5 lg:px-8">
      <button type="button" onClick={onToggleSidebar} aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        aria-expanded={isSidebarOpen}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary-light text-primary lg:hidden">
        <Menu size={20} />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
        <span className={`truncate ${record ? "hidden text-text-secondary sm:inline" : "font-semibold text-primary-second"}`}>{title}</span>
        {record && (
          <>
            <span className="hidden text-text-light sm:inline">/</span>
            <span className="truncate font-semibold text-primary-second">{record}</span>
          </>
        )}
      </div>

      <form onSubmit={jump} role="search"
        className="hidden h-11 w-[300px] items-center gap-2 rounded-xl border border-primary-light bg-white px-3 text-text-secondary transition-colors focus-within:border-border md:flex xl:w-[340px]">
        <Search size={17} className="shrink-0" />
        <input value={code} onChange={(e) => setCode(e.target.value)} aria-label="Go to an order, bill or client code"
          placeholder="Go to ORD / BILL / CL code"
          className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary" />
        <kbd className="hidden rounded-md border border-primary-light px-1.5 py-0.5 text-[11px] font-semibold xl:inline">Enter</kbd>
      </form>

      <NotificationBell />

      <div className="flex items-center gap-3 rounded-xl py-1 pl-1 pr-1 sm:pr-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initials(name)}
        </div>
        <div className="hidden text-left leading-tight sm:block">
          <p className="max-w-[140px] truncate text-sm font-semibold text-text-primary">{name}</p>
          <p className="max-w-[140px] truncate text-xs text-text-secondary">{isSuperAdmin ? "Super Admin" : user?.roleName ?? user?.role}</p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
