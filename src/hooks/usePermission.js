import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ACTIONS, MODULES, can as permKey } from "../constant/permissions";

/**
 * The single way the panel asks "is this user allowed to do X".
 *
 * Returns helpers rather than a raw array so no screen ever has to know how
 * permissions are stored, and so the super-admin shortcut lives in exactly one
 * place instead of being re-checked (and eventually forgotten) at each call.
 *
 *   const { can, canAny, isSuperAdmin } = usePermission();
 *   if (can(MODULE.ORDERS, 'create')) { ... }
 *
 * This is a CONVENIENCE, not the security boundary — every endpoint is gated
 * again on the server. Hiding a button stops mistakes; the API stops attacks.
 */
export function usePermission() {
  const user = useSelector((state) => state.auth.user);

  return useMemo(() => {
    const isSuperAdmin = Boolean(user?.isSuperAdmin);
    const held = new Set(Array.isArray(user?.permissions) ? user.permissions : []);

    /** True if the user holds `module.action`. Super admins always pass. */
    const can = (moduleKey, action = ACTIONS.VIEW) => {
      if (!user) return false;
      if (isSuperAdmin) return true;
      return held.has(permKey(moduleKey, action));
    };

    /** True if the user holds ANY of the given [module, action] pairs. */
    const canAny = (...pairs) =>
      pairs.flat().some((pair) =>
        Array.isArray(pair) ? can(pair[0], pair[1]) : can(pair)
      );

    /** True if the user can open the module at all (i.e. holds its `view`). */
    const canViewModule = (moduleKey) => can(moduleKey, ACTIONS.VIEW);

    /** Modules this user may see, in sidebar order. */
    const allowedModules = MODULES.filter((m) => canViewModule(m.key));

    /**
     * Where to send someone who has no business on the page they asked for.
     * Falls back to their first allowed screen so a user without Dashboard
     * access still lands somewhere useful instead of on an error.
     */
    const landingPath =
      allowedModules.find((m) => m.path)?.path ?? "/no-access";

    return {
      user,
      isSuperAdmin,
      permissions: held,
      can,
      canAny,
      canViewModule,
      allowedModules,
      landingPath,
      hasAnyAccess: isSuperAdmin || allowedModules.length > 0,
    };
  }, [user]);
}

export default usePermission;
