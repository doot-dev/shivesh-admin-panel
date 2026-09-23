import { usePermission } from "../../hooks/usePermission";
import { ACTIONS } from "../../constant/permissions";

/**
 * Renders its children only if the signed-in user holds the permission.
 *
 * Use it to wrap buttons and whole sections so the UI matches what the API
 * will actually allow:
 *
 *   <Can module={MODULE.ORDERS} action="create">
 *     <Button onClick={openAddOrder}>Add Order</Button>
 *   </Can>
 *
 * Pass `fallback` to show something instead (a disabled state, an explanation);
 * by default a disallowed block renders nothing at all.
 */
export function Can({
  module: moduleKey,
  action = ACTIONS.VIEW,
  any,
  fallback = null,
  children,
}) {
  const { can, canAny } = usePermission();

  const allowed = any?.length ? canAny(any) : can(moduleKey, action);
  if (!allowed) return fallback;

  return children;
}

export default Can;
