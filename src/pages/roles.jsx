import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Button, Modal, Input } from "../components/ui";
import PermissionMatrix from "../components/roles/PermissionMatrix";
import { usePermission } from "../hooks/usePermission";
import { MODULE, ACTIONS } from "../constant/permissions";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissionCatalog,
  getClientPermissionCatalog,
  getClientRoles,
  createClientRole,
  updateClientRole,
  deleteClientRole,
} from "../services/roleService";

/**
 * Roles & Permissions — where an admin defines what each job can do.
 *
 * A role is a named bundle of `module.action` grants. Users are put on a role
 * from the Users screen; per-user exceptions live there too, because they are a
 * property of the person rather than of the job.
 */
const emptyDraft = { name: "", description: "", isActive: true, permissions: [] };

// The same screen runs the panel's roles and the client app's roles (docs/06).
const VARIANTS = {
  panel: {
    module: MODULE.ROLES,
    title: "Roles & Permissions",
    subtitle: "Decide what each job can see and do in the panel.",
    api: { list: getRoles, catalog: getPermissionCatalog, create: createRole, update: updateRole, remove: deleteRole },
    people: ["user", "users", "Users"],
    placeholder: "e.g. Accounts, Site Supervisor",
    lockedNote:
      "The Super Admin role always holds every permission and cannot be edited or deleted. This is what stops the panel being locked down by mistake.",
  },
  client: {
    module: MODULE.CLIENT_ROLES,
    title: "Client Roles",
    subtitle:
      "What each person in a client's company can do in the client app. A change applies to everyone on that role, at every client, at once.",
    api: { list: getClientRoles, catalog: getClientPermissionCatalog, create: createClientRole, update: updateClientRole, remove: deleteClientRole },
    people: ["contact", "contacts", "Contacts"],
    placeholder: "e.g. Site Engineer, Accounts",
    lockedNote:
      "The Owner role always holds everything and cannot be edited or deleted. Only the office can make someone an Owner, from the client's Team tab.",
  },
};

const RolesPage = ({ variant = "panel" }) => {
  const cfg = VARIANTS[variant];
  const { can } = usePermission();
  const canCreate = can(cfg.module, ACTIONS.CREATE);
  const canUpdate = can(cfg.module, ACTIONS.UPDATE);
  const canDelete = can(cfg.module, ACTIONS.DELETE);

  const [roles, setRoles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(null); // null = closed, {} = new
  const [draft, setDraft] = useState(emptyDraft);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [roleRes, catalogRes] = await Promise.all([
        cfg.api.list(),
        cfg.api.catalog(),
      ]);
      setRoles(roleRes?.data ?? []);
      // The API sends actions as { action, key }; the matrix works with plain action names.
      setCatalog(
        (catalogRes?.data?.modules ?? []).map((m) => ({
          ...m,
          actions: (m.actions ?? []).map((a) => (typeof a === "string" ? a : a.action)),
        }))
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? "Could not load roles"
      );
    } finally {
      setLoading(false);
    }
  }, [cfg]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setDraft(emptyDraft);
    setEditing({ isNew: true });
  };

  const openEdit = (role) => {
    setDraft({
      name: role.name,
      description: role.description ?? "",
      isActive: role.isActive,
      permissions: role.permissions ?? [],
    });
    setEditing(role);
  };

  const closeModal = () => {
    setEditing(null);
    setDraft(emptyDraft);
  };

  const handleSave = async () => {
    if (!draft.name.trim()) {
      toast.error("Give the role a name");
      return;
    }

    setSaving(true);
    try {
      if (editing?.isNew) {
        await cfg.api.create(draft);
        toast.success("Role created");
      } else {
        await cfg.api.update({ id: editing.id, ...draft });
        toast.success("Role updated");
      }
      closeModal();
      await load();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? "Could not save the role"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await cfg.api.remove(confirmDelete.id);
      toast.success("Role deleted");
      setConfirmDelete(null);
      await load();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? "Could not delete the role"
      );
    } finally {
      setSaving(false);
    }
  };

  // The Super Admin role is built in: it always holds everything, so editing it
  // would be meaningless and deleting it could lock the whole team out.
  const isLocked = (role) => role.isSystem;

  const totalPermissions = useMemo(
    () => catalog.reduce((sum, m) => sum + (m.actions?.length ?? 0), 0),
    [catalog]
  );

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {cfg.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {cfg.subtitle}
          </p>
        </div>

        {canCreate && (
          <Button variant="primary" onClick={openCreate}>
            Add Role
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-gray-500">
          Loading roles...
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center">
          <p className="text-sm text-gray-500">No roles yet.</p>
          {canCreate && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Create the first one
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-600">Role</th>
                <th className="px-5 py-3 font-medium text-gray-600">{cfg.people[2]}</th>
                <th className="px-5 py-3 font-medium text-gray-600">
                  Permissions
                </th>
                <th className="px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="px-5 py-3 text-right font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900">
                      {role.name}
                      {role.isSystem && (
                        <span className="ml-2 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-600">
                          Built in
                        </span>
                      )}
                    </div>
                    {role.description && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {role.description}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-gray-700">
                    {role.userCount}
                  </td>

                  <td className="px-5 py-3.5 text-gray-700">
                    {role.isSystem
                      ? "Everything"
                      : `${role.permissions?.length ?? 0} of ${totalPermissions}`}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        role.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {role.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(role)}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {canUpdate && !isLocked(role) ? "Edit" : "View"}
                      </button>

                      {canDelete && !isLocked(role) && (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(role)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / edit */}
      <Modal
        isOpen={Boolean(editing)}
        onClose={closeModal}
        title={
          editing?.isNew
            ? "Add Role"
            : isLocked(editing ?? {})
              ? `${editing?.name} (built in)`
              : `Edit ${editing?.name ?? "Role"}`
        }
        size="5xl"
        showHeaderIcon={false}
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            {(editing?.isNew ? canCreate : canUpdate) &&
              !isLocked(editing ?? {}) && (
                <Button variant="primary" onClick={handleSave} loading={saving}>
                  {editing?.isNew ? "Create Role" : "Save Changes"}
                </Button>
              )}
          </>
        }
      >
        {isLocked(editing ?? {}) && (
          <div className="mb-4 rounded-lg bg-purple-50 px-4 py-3 text-sm text-purple-700">
            {cfg.lockedNote}
          </div>
        )}

        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <Input
            label="Role name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder={cfg.placeholder}
            disabled={isLocked(editing ?? {})}
          />
          <Input
            label="Description"
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            placeholder="What this role is for"
            disabled={isLocked(editing ?? {})}
          />
        </div>

        <label className="mb-5 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
            disabled={isLocked(editing ?? {})}
            className="h-4 w-4 accent-primary"
          />
          Active — turning this off instantly removes access for everyone on
          this role
        </label>

        <PermissionMatrix
          catalog={catalog}
          selected={
            isLocked(editing ?? {})
              ? catalog.flatMap((m) =>
                  (m.actions ?? []).map((a) => `${m.key}.${a}`)
                )
              : draft.permissions
          }
          onChange={(permissions) => setDraft({ ...draft, permissions })}
          disabled={isLocked(editing ?? {}) || saving}
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete role"
        size="md"
        showHeaderIcon={false}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Delete <strong>{confirmDelete?.name}</strong>? Anyone still on this
          role would lose their access, so move them to another role first.
        </p>
        {confirmDelete?.userCount > 0 && (
          <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {confirmDelete.userCount}{" "}
            {confirmDelete.userCount === 1 ? `${cfg.people[0]} is` : `${cfg.people[1]} are`}{" "}
            currently on this role.
          </p>
        )}
      </Modal>
    </div>
  );
};

export default RolesPage;
