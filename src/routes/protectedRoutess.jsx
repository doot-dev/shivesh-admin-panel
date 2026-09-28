import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { refreshSession } from "../features/auth/authThunks";
import { usePermission } from "../hooks/usePermission";
import { moduleForPath, ALWAYS_ALLOWED_PATHS } from "../constant/permissions";
import FullPageLoader from "../components/ui/FullPageLoader";

/**
 * Gates every signed-in route on two questions: are you logged in, and are you
 * allowed on THIS page.
 *
 * It re-resolves permissions from the server once per boot before deciding.
 * Without that wait, a user whose role was changed while they were away would
 * briefly render pages they can no longer open — and worse, a user whose access
 * was just widened would be bounced off a page they are now entitled to.
 */
const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, sessionChecked } = useSelector((state) => state.auth);
  const { can, canViewModule, hasAnyAccess, landingPath } = usePermission();
  const requested = useRef(false);

  // Role changes made while this tab was open apply when it is next focused.
  // ponytail: at most once a minute; a push over the socket if that is too slow.
  useEffect(() => {
    let last = Date.now();
    const onFocus = () => {
      if (!user || Date.now() - last < 60_000) return;
      last = Date.now();
      dispatch(refreshSession());
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, dispatch]);

  useEffect(() => {
    // Only once per page load, and only if we think we have a session at all.
    if (user && !sessionChecked && !requested.current) {
      requested.current = true;
      dispatch(refreshSession());
    }
  }, [user, sessionChecked, dispatch]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Hold the UI until we know the real permissions.
  // `isVisible` must be passed explicitly — the loader defaults to hidden and
  // would otherwise render an empty white screen during the check.
  if (!sessionChecked) {
    return <FullPageLoader isVisible message="Checking your access..." />;
  }

  // A user with a role but no granted modules would otherwise land on an empty
  // shell with no explanation of why nothing is there.
  if (!hasAnyAccess) {
    return location.pathname === "/no-access" ? (
      <Outlet />
    ) : (
      <Navigate to="/no-access" replace />
    );
  }

  if (ALWAYS_ALLOWED_PATHS.includes(location.pathname)) {
    return <Outlet />;
  }

  const owningModule = moduleForPath(location.pathname);

  // Unmapped paths (e.g. a stray URL) fall through to the router's own
  // handling rather than being treated as forbidden.
  if (owningModule && !canViewModule(owningModule.key)) {
    return <Navigate to={landingPath} replace />;
  }
  // A create page (e.g. /orders/add) also needs the module's create permission.
  if (owningModule && location.pathname.endsWith("/add") && !can(owningModule.key, "create")) {
    return <Navigate to={owningModule.path ?? landingPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
