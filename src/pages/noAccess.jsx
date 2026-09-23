import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { closeSocket } from "../services/socket";
import { usePermission } from "../hooks/usePermission";

/**
 * Shown when a signed-in user has no modules granted at all.
 *
 * This exists so the panel never presents a blank shell: a new employee whose
 * role has not been set up yet gets a clear explanation and a way out, instead
 * of an empty sidebar that looks like the app is broken.
 */
const NoAccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = usePermission();

  const handleLogout = () => {
    closeSocket();
    dispatch(logout());
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <svg
            className="h-8 w-8 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-gray-900">
          No access yet
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {user?.name ? `${user.name}, your` : "Your"} account is active, but no
          permissions have been assigned to it yet. Ask an administrator to give
          you a role from the Users screen.
        </p>

        {user?.roleName ? (
          <p className="mt-4 text-xs text-gray-400">
            Current role: {user.roleName}
          </p>
        ) : (
          <p className="mt-4 text-xs text-gray-400">No role assigned</p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default NoAccess;
