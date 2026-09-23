import { useMemo } from "react";
import { ACTION_LABELS } from "../../constant/permissions";

/**
 * The module × action grid used to build a role.
 *
 * Renders from the catalog the API returns rather than a hardcoded list, so a
 * permission added on the backend shows up here without a panel change.
 *
 * Two conveniences that matter in practice:
 *   - ticking any action auto-ticks `view`, because a role that can edit orders
 *     but not open the Orders screen is never what anyone meant;
 *   - unticking `view` clears the whole row, for the same reason.
 */
const PermissionMatrix = ({ catalog = [], selected = [], onChange, disabled = false }) => {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // Union of every action across all modules, so columns line up even though
  // e.g. Reports has no "create".
  const columns = useMemo(() => {
    const seen = [];
    for (const mod of catalog) {
      for (const action of mod.actions ?? []) {
        if (!seen.includes(action)) seen.push(action);
      }
    }
    return seen;
  }, [catalog]);

  const emit = (next) => onChange?.([...next]);

  const toggle = (mod, action) => {
    if (disabled) return;
    const key = `${mod.key}.${action}`;
    const next = new Set(selectedSet);
    const viewKey = `${mod.key}.view`;

    if (next.has(key)) {
      next.delete(key);
      // Removing `view` removes the whole module — the other actions would be
      // unreachable anyway.
      if (action === "view") {
        for (const a of mod.actions ?? []) next.delete(`${mod.key}.${a}`);
      }
    } else {
      next.add(key);
      if (mod.actions?.includes("view")) next.add(viewKey);
    }

    emit(next);
  };

  const toggleModule = (mod) => {
    if (disabled) return;
    const keys = (mod.actions ?? []).map((a) => `${mod.key}.${a}`);
    const allOn = keys.every((k) => selectedSet.has(k));
    const next = new Set(selectedSet);
    keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
    emit(next);
  };

  const toggleAll = () => {
    if (disabled) return;
    const all = catalog.flatMap((m) => (m.actions ?? []).map((a) => `${m.key}.${a}`));
    const allOn = all.every((k) => selectedSet.has(k));
    emit(allOn ? new Set() : new Set(all));
  };

  const grantedCount = selectedSet.size;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {grantedCount} permission{grantedCount === 1 ? "" : "s"} selected
        </p>
        <button
          type="button"
          onClick={toggleAll}
          disabled={disabled}
          className="text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Toggle all
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Module
              </th>
              {columns.map((action) => (
                <th
                  key={action}
                  className="px-3 py-3 text-center font-medium text-gray-600 whitespace-nowrap"
                >
                  {ACTION_LABELS[action] ?? action}
                </th>
              ))}
              <th className="px-3 py-3 text-center font-medium text-gray-600">
                All
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {catalog.map((mod) => {
              const keys = (mod.actions ?? []).map((a) => `${mod.key}.${a}`);
              const allOn = keys.length > 0 && keys.every((k) => selectedSet.has(k));

              return (
                <tr key={mod.key} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">
                    {mod.label}
                  </td>

                  {columns.map((action) => {
                    const supported = mod.actions?.includes(action);
                    const key = `${mod.key}.${action}`;
                    return (
                      <td key={action} className="px-3 py-2.5 text-center">
                        {supported ? (
                          <input
                            type="checkbox"
                            checked={selectedSet.has(key)}
                            onChange={() => toggle(mod, action)}
                            disabled={disabled}
                            className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed"
                          />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={allOn}
                      onChange={() => toggleModule(mod)}
                      disabled={disabled}
                      className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionMatrix;
