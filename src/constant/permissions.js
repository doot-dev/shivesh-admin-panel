/**
 * Panel-side mirror of the backend permission catalog.
 *
 * This is the SECOND copy — the authority is
 * `shivesh-backend/src/config/permissions.js`, which is what actually enforces
 * access. This copy exists so the sidebar and route guard can decide instantly
 * on first paint without waiting for a network round-trip.
 *
 * Keep the two in sync when adding a module or action. The Roles screen renders
 * its matrix from the catalog the API returns, not from here, so a drift shows
 * up as a missing menu item rather than a security hole.
 */

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  APPROVE: 'approve',
};

const CRUD = [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE];

/** Module keys, used everywhere instead of bare strings. */
export const MODULE = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  ROLES: 'roles',
  PRODUCTS: 'products',
  SUBCATEGORIES: 'subcategories',
  CLIENTS: 'clients',
  VENDORS: 'vendors',
  LEADS: 'leads',
  PROJECTS: 'projects',
  ORDERS: 'orders',
  CUBE_TESTS: 'cubeTests',
  BILLING: 'billing',
  PAYMENTS: 'payments',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
};

/** Mirrors MODULES in the backend catalog, in sidebar order. */
export const MODULES = [
  { key: MODULE.DASHBOARD, label: 'Dashboard', path: '/dashboard', actions: [ACTIONS.VIEW] },
  { key: MODULE.USERS, label: 'Users', path: '/users', actions: CRUD },
  { key: MODULE.ROLES, label: 'Roles & Permissions', path: '/roles', actions: CRUD },
  { key: MODULE.PRODUCTS, label: 'Product', path: '/products', actions: CRUD },
  { key: MODULE.SUBCATEGORIES, label: 'Sub-category', path: '/subcategories', actions: CRUD },
  { key: MODULE.CLIENTS, label: 'Client', path: '/clients', actions: CRUD },
  { key: MODULE.VENDORS, label: 'Vendor', path: '/vendors', actions: CRUD },
  { key: MODULE.LEADS, label: 'Leads', path: '/leads', actions: CRUD },
  { key: MODULE.PROJECTS, label: 'Project', path: '/projects', actions: CRUD },
  { key: MODULE.ORDERS, label: 'Orders & Tracks', path: '/orders', actions: [...CRUD, ACTIONS.APPROVE] },
  { key: MODULE.CUBE_TESTS, label: 'Cube Testing', path: '/testing', actions: CRUD },
  { key: MODULE.BILLING, label: 'Billing', path: '/billing', actions: [...CRUD, ACTIONS.APPROVE] },
  { key: MODULE.PAYMENTS, label: 'Payments', path: null, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.DELETE] },
  { key: MODULE.REPORTS, label: 'Reports', path: '/reports', actions: [ACTIONS.VIEW, ACTIONS.EXPORT] },
  { key: MODULE.NOTIFICATIONS, label: 'Notifications', path: null, actions: [ACTIONS.VIEW] },
  { key: MODULE.SETTINGS, label: 'Settings', path: '/settings', actions: [ACTIONS.VIEW, ACTIONS.UPDATE] },
];

/** Build a permission key: can(MODULE.ORDERS, 'create') -> "orders.create". */
export function can(moduleKey, action = ACTIONS.VIEW) {
  return `${moduleKey}.${action}`;
}

/** Human labels for the permission matrix column headers. */
export const ACTION_LABELS = {
  [ACTIONS.VIEW]: 'View',
  [ACTIONS.CREATE]: 'Create',
  [ACTIONS.UPDATE]: 'Edit',
  [ACTIONS.DELETE]: 'Delete',
  [ACTIONS.EXPORT]: 'Export',
  [ACTIONS.APPROVE]: 'Approve',
};

/**
 * Route paths that are reachable without any module permission.
 * Everything else in the panel requires the matching module's `view`.
 */
export const ALWAYS_ALLOWED_PATHS = ['/no-access'];

/**
 * Find the module that owns a panel route, so the route guard can decide
 * without a hardcoded path->permission table.
 *
 * Matches the longest path first: "/orders/add" must resolve to the orders
 * module, not fall through for want of an exact entry.
 */
export function moduleForPath(pathname) {
  if (!pathname) return null;
  const candidates = MODULES.filter((m) => m.path)
    .filter((m) => pathname === m.path || pathname.startsWith(`${m.path}/`))
    .sort((a, b) => b.path.length - a.path.length);
  return candidates[0] ?? null;
}
