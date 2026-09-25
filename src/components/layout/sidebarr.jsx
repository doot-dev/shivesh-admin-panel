import { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard, Truck, FlaskConical, BriefcaseBusiness, Building2, Store, Filter,
  ReceiptText, ChartLine, Package, Layers, Users, ShieldCheck, SlidersHorizontal, LogOut, X,
} from "lucide-react";
import { logout } from "../../features/auth/authSlice";
import { closeSocket } from "../../services/socket";
import { usePermission } from "../../hooks/usePermission";
import { MODULE } from "../../constant/permissions";
import LogoImg from "../../assets/img/shivesh-logo.png";
import { initials } from "../../utils/labels";

/**
 * Navy sidebar, grouped by what people do (operations, money, catalogue,
 * administration). Only modules the user can open are shown, and a group with
 * nothing visible disappears — so an accountant never sees an empty
 * "Administration" heading.
 */
const GROUPS = [
  { label: "Overview", items: [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", module: MODULE.DASHBOARD },
  ] },
  { label: "Operations", items: [
    { key: "orders", icon: Truck, label: "Orders & Tracks", path: "/orders", module: MODULE.ORDERS },
    { key: "testing", icon: FlaskConical, label: "Cube Testing", path: "/testing", module: MODULE.CUBE_TESTS },
    { key: "projects", icon: BriefcaseBusiness, label: "Projects", path: "/projects", module: MODULE.PROJECTS },
    { key: "clients", icon: Building2, label: "Clients", path: "/clients", module: MODULE.CLIENTS },
    { key: "vendors", icon: Store, label: "Vendors", path: "/vendors", module: MODULE.VENDORS },
    { key: "leads", icon: Filter, label: "Leads", path: "/leads", module: MODULE.LEADS },
  ] },
  { label: "Money", items: [
    { key: "billing", icon: ReceiptText, label: "Billing", path: "/billing", module: MODULE.BILLING },
    { key: "reports", icon: ChartLine, label: "Reports", path: "/reports", module: MODULE.REPORTS },
  ] },
  { label: "Catalogue", items: [
    { key: "products", icon: Package, label: "Products", path: "/products", module: MODULE.PRODUCTS },
    { key: "subcategories", icon: Layers, label: "Sub-categories", path: "/subcategories", module: MODULE.SUBCATEGORIES },
  ] },
  { label: "Administration", items: [
    { key: "users", icon: Users, label: "Users", path: "/users", module: MODULE.USERS },
    { key: "roles", icon: ShieldCheck, label: "Roles & Permissions", path: "/roles", module: MODULE.ROLES },
    { key: "settings", icon: SlidersHorizontal, label: "Settings", path: "/settings", module: MODULE.SETTINGS },
  ] },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { canViewModule, isSuperAdmin, user } = usePermission();

  // Escape closes the drawer on phones and tablets.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleLogout = () => {
    // Close the realtime socket BEFORE clearing storage: it is authenticated
    // with this user's token, so leaving it open would let the next person to
    // use this browser keep receiving the previous user's order events.
    closeSocket();
    dispatch(logout());
    localStorage.clear();
    navigate("/");
  };

  // /orders is active on /orders and /orders/ORD-…, and so on for every module.
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const groups = GROUPS
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.module || canViewModule(i.module)) }))
    .filter((g) => g.items.length);

  const name = user?.name ?? user?.userName ?? "";
  const role = isSuperAdmin ? "Super Admin" : user?.roleName ?? "No role assigned";

  return (
    <>
      {isOpen && (
        <div className="sv-fade fixed inset-0 z-40 bg-primary-second/55 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] max-w-[86vw] flex-col overflow-hidden bg-primary-second text-white shadow-2xl transition-transform duration-300 ease-out
          lg:static lg:z-auto lg:w-[260px] lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Soft decorative disc — depth without an image. */}
        <div className="pointer-events-none absolute -right-44 -top-36 h-80 w-80 rounded-full bg-primary opacity-55" />

        <div className="relative flex items-center gap-3 px-6 pb-5 pt-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_8px_20px_rgba(10,20,60,.3)]">
            <img src={LogoImg} alt="" className="h-8 w-8 object-contain" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="text-[17px] font-bold tracking-[.08em]">SHIVESH</span>
            <span className="text-[11px] text-primary-bg-alt">Group of Companies</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close menu"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-primary-light hover:bg-white/10 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="relative flex-1 space-y-5 overflow-y-auto px-4 pb-4">
          {groups.map((g) => (
            <div key={g.label} className="space-y-0.5">
              <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[.12em] text-primary-bg-alt">{g.label}</div>
              {g.items.map(({ key, icon, label, path }) => {
                const active = isActive(path);
                const IconCmp = icon;
                return (
                  <Link key={key} to={path} onClick={onClose} aria-current={active ? "page" : undefined}
                    className={`flex h-10 items-center gap-3 rounded-[10px] px-3 text-sm transition-colors duration-200
                      ${active
                        ? "bg-primary-light font-semibold text-primary shadow-[0_6px_16px_rgba(10,20,60,.25)]"
                        : "font-medium text-primary-light/80 hover:bg-white/10 hover:text-white"}`}>
                    <IconCmp size={19} strokeWidth={1.8} className="shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Who you are acting as — explains why a menu someone expects is missing. */}
        <div className="relative m-4 mt-0 flex items-center gap-3 rounded-2xl bg-white/[.08] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-bg-alt text-sm font-bold text-primary-second">
            {initials(name)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{name}</span>
            <span className="truncate text-xs text-primary-bg-alt">{role}</span>
          </div>
          <button type="button" onClick={handleLogout} aria-label="Log out" title="Log out"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-light transition-colors hover:bg-white/10 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
