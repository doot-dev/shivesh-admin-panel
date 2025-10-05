export { default as Icon } from "./Icon";

// Export individual icon names for easy reference
export const ICON_NAMES = {
  // Navigation Icons - matching your /assets/icons/ folder
  DASHBOARD: "dashboard",
  LAYOUT_DASHBOARD: "dashboard", // alias
  USERS: "user",
  USER: "user",
  PACKAGE: "product",
  PRODUCT: "product",
  CLIENT: "client",
  ID_CARD_LANYARD: "client", // alias
  HANDSHAKE: "client", // alias
  VENDOR: "vendor",
  TRUCK: "vendor", // alias
  LEADS: "leads",
  CHART_LINE: "leads", // alias
  PROJECTS: "projects",
  BRIEFCASE_BUSINESS: "projects", // alias
  ORDERS: "orderandtrucks",
  ORDER_AND_TRUCKS: "orderandtrucks",
  CUBE_TESTING: "cubetesting",
  FUNNEL: "cubetesting", // alias
  BILLING: "billing",
  RECEIPT_TEXT: "billing", // alias
  REPORTS: "reports",
  FILE_CHART_COLUMN_INCREASING: "reports", // alias
  SETTINGS: "settings",
  LOG_OUT: "log-out",
  NOTIFICATION: "notification",
  ADD_NEW_USER: "add-new-user",
  USER_DETAILS: "user-details",
  EDIT_USER: "edit-user",
  TICK: "tick",
  PRODUCT_MODAL: "product-modal",

  // UI Icons (inline SVG)
  SEARCH: "search",
  PLUS: "plus",
  EDIT: "edit",
  TRASH_2: "trash-2",
  EYE: "eye",
  EYE_OFF: "eye-off",
  MENU: "menu",
  X: "x",
  CHEVRON_DOWN: "chevron-down",
  CHEVRON_RIGHT: "chevron-right",
  CHEVRON_LEFT: "chevron-left",
  CHEVRON_UP: "chevron-up",
  CHEVRON_UP_DOWN: "chevron-up-down",
  DOLLAR_SIGN: "dollar-sign",
  TRENDING_UP: "trending-up",
  INBOX: "inbox",
  CHECK: "check",
};

// Note: For convenience components with JSX, import Icon and ICON_NAMES and create them in your component files
// Example: const DashboardIcon = (props) => <Icon name={ICON_NAMES.DASHBOARD} {...props} />;
