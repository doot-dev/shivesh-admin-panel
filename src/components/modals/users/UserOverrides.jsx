import { useMemo, useState } from "react";
import { MODULES, ACTION_LABELS } from "../../../constant/permissions";

/**
 * Per-user exceptions to their role.
 *
 * This is what stops the role list turning into forty near-identical roles
 * because one person needed one extra button. Each permission sits in one of
 * three states:
 *
 *   Role default — inherit whatever the role says (no row stored)
 *   Allow        — grant it even though the role lacks it
 *   Deny         — take it away even though the role grants it
 *
 * Deny beats Allow on the server, so the two can never contradict each other.
 */
const UserOverrides = ({ overrides = [], rolePermissions = [], onChange }) => {
  const [open, setOpen] = useState(false);

  const overrideMap = useMemo(() => {
    const map = new Map();
    for (const o of overrides) map.set(o.permission, o.effect);
    return map;
  }, [overrides]);

  const roleSet = useMemo(() => new Set(rolePermissions), [rolePermissions]);

  const setEffect = (permission, effect) => {
    const next = overrides.filter((o) => o.permission !== permission);
    if (effect) next.push({ permission, effect });
    onChange?.(next);
  };

  const exceptionCount = overrides.length;

  return (
    <div className="mt-5 rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span>
          <span className="text-sm font-medium text-gray-800">
            Exceptions for this person
          </span>
          <span className="ml-2 text-xs text-gray-500">
            {exceptionCount === 0
              ? "none — follows the role exactly"
              : `${exceptionCount} set`}
          </span>
        </span>
        <span className="text-xs font-medium text-primary">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="mb-3 text-xs text-gray-500">
            Leave everything on <strong>Role default</strong> unless this person
            genuinely differs from their job. Deny always wins over Allow.
          </p>

          <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
            {MODULES.map((mod) => (
              <div key={mod.key}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {mod.label}
                </p>

                <div className="space-y-1">
                  {mod.actions.map((action) => {
                    const permission = `${mod.key}.${action}`;
                    const current = overrideMap.get(permission) ?? "";
                    const fromRole = roleSet.has(permission);

                    return (
                      <div
                        key={permission}
                        className="flex items-center justify-between gap-3 rounded px-2 py-1 hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-700">
                          {ACTION_LABELS[action] ?? action}
                          <span
                            className={`ml-2 text-[11px] ${
                              fromRole ? "text-green-600" : "text-gray-400"
                            }`}
                          >
                            {fromRole ? "role grants this" : "role does not"}
                          </span>
                        </span>

                        <select
                          value={current}
                          onChange={(e) =>
                            setEffect(permission, e.target.value || null)
                          }
                          className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700"
                        >
                          <option value="">Role default</option>
                          <option value="ALLOW">Allow</option>
                          <option value="DENY">Deny</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {exceptionCount > 0 && (
            <button
              type="button"
              onClick={() => onChange?.([])}
              className="mt-3 text-xs font-medium text-red-600 hover:underline"
            >
              Clear all exceptions
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserOverrides;
