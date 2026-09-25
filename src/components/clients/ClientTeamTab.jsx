import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import usePermission from "../../hooks/usePermission";
import { MODULE, ACTIONS } from "../../constant/permissions";
import { Modal, Button, Input, Table } from "../ui";
import StatusChip from "../ui/StatusChip";

/**
 * Client → Team (docs/06): the people who log in to the client app. Each has
 * their own phone, one client role (edited under Client Roles) and either all
 * of the client's projects or only some. Only the office can make an Owner.
 */
const errMsg = (e, fallback) => e?.response?.data?.message || fallback;
const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "Never");
const blank = { name: "", phone: "", designation: "", roleId: "", allProjects: true, projects: [] };
const field = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none";

export default function ClientTeamTab({ clientId }) {
  const { can } = usePermission();
  const canEdit = can(MODULE.CLIENTS, ACTIONS.UPDATE);
  const [rows, setRows] = useState(null);
  const [roles, setRoles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(null); // null = closed; has `id` when editing
  const [confirm, setConfirm] = useState(null); // contact to remove
  const [saving, setSaving] = useState(false);
  const base = `/api/v1/admin/client/${clientId}/contacts`;

  const load = useCallback(async () => {
    if (!clientId) return;
    try {
      setRows((await api.get(base)).data.data ?? []);
    } catch (e) {
      setRows([]);
      toast.error(errMsg(e, "Could not load the team"));
    }
  }, [base, clientId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!clientId) return;
    api.get("/api/v1/admin/roles/client/all")
      .then((r) => setRoles((r.data.data ?? []).filter((x) => x.isActive)))
      .catch(() => setRoles([]));
    api.get("/api/v1/admin/project/list", { params: { clientId, limit: 500 } })
      .then((r) => setProjects(r.data.data?.projects || r.data.data || []))
      .catch(() => setProjects([]));
  }, [clientId]);

  const run = async (fn, ok) => {
    setSaving(true);
    try {
      await fn();
      toast.success(ok);
      setForm(null);
      setConfirm(null);
      load();
    } catch (e) {
      toast.error(errMsg(e, "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  const save = () => {
    const body = { ...form, roleId: Number(form.roleId) };
    return run(
      () => (form.id ? api.put(`${base}/${form.id}`, body) : api.post(base, body)),
      form.id ? "Contact saved" : `${form.name} can now sign in to the client app`,
    );
  };
  const toggleActive = (c) =>
    run(() => api.put(`${base}/${c.id}`, { isActive: !c.isActive }), c.isActive ? `${c.name} can no longer sign in` : `${c.name} can sign in again`);

  const openEdit = (c) =>
    setForm({
      id: c.id,
      name: c.name,
      phone: c.phone,
      designation: c.designation ?? "",
      roleId: String(c.role.id),
      allProjects: c.allProjects,
      projects: c.projects.map((p) => p.projectId),
    });

  const toggleProject = (code) =>
    setForm((f) => ({ ...f, projects: f.projects.includes(code) ? f.projects.filter((x) => x !== code) : [...f.projects, code] }));

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (_v, c) => (
        <div>
          <div className="flex items-center gap-2 font-medium text-text-primary">
            {c.name}
            {!c.isActive && <StatusChip tone="muted" dot={false}>Inactive</StatusChip>}
          </div>
          {c.designation && <div className="text-xs text-text-secondary">{c.designation}</div>}
        </div>
      ),
    },
    { key: "phone", header: "Phone" },
    { key: "role", header: "Role", render: (_v, c) => <StatusChip tone={c.role.isOwner ? "primary" : "muted"} dot={false}>{c.role.name}</StatusChip> },
    {
      key: "projects",
      header: "Projects",
      render: (_v, c) => (c.allProjects ? "All projects" : c.projects.map((p) => p.projectName).join(", ") || "—"),
    },
    { key: "lastLoginAt", header: "Last sign-in", render: (v) => when(v) },
    ...(canEdit
      ? [{
          key: "actions",
          header: "",
          render: (_v, c) => (
            <div className="flex justify-end gap-2 whitespace-nowrap">
              <button type="button" onClick={() => openEdit(c)} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Edit</button>
              <button type="button" onClick={() => toggleActive(c)} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                {c.isActive ? "Deactivate" : "Activate"}
              </button>
              <button type="button" onClick={() => setConfirm(c)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Remove</button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-text-secondary">
          Everyone here signs in to the client app with their own number and OTP. Their role decides what they can see and do;
          change roles under <span className="font-medium">Client Roles</span>.
        </p>
        {canEdit && (
          <Button variant="primary" onClick={() => setForm({ ...blank, roleId: String(roles.find((r) => !r.isSystem)?.id ?? "") })}>
            Add contact
          </Button>
        )}
      </div>

      <Table columns={columns} data={rows ?? []} loading={rows === null} emptyMessage="No one can sign in for this client yet" />

      <Modal
        isOpen={Boolean(form)}
        onClose={() => setForm(null)}
        title={form?.id ? `Edit ${form.name}` : "Add contact"}
        size="lg"
        showHeaderIcon={false}
        footer={
          <>
            <Button variant="outline" onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={save} loading={saving}>{form?.id ? "Save" : "Add contact"}</Button>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rakesh Pawar" />
              <Input
                label="Mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                placeholder="10-digit mobile"
                inputMode="numeric"
              />
              <Input label="Designation (optional)" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Site Engineer" />
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-text-primary">Role</span>
                <select className={field} value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                  <option value="" disabled>Choose a role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}{r.isSystem ? " (full access)" : ""}</option>
                  ))}
                </select>
              </label>
            </div>

            <fieldset className="rounded-lg border border-gray-200 p-3">
              <legend className="px-1 text-sm font-medium text-text-primary">Projects</legend>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" className="accent-primary" checked={form.allProjects} onChange={() => setForm({ ...form, allProjects: true })} />
                  All projects, including new ones
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" className="accent-primary" checked={!form.allProjects} onChange={() => setForm({ ...form, allProjects: false })} />
                  Only these
                </label>
              </div>
              {!form.allProjects && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {projects.length === 0 && <p className="text-sm text-text-secondary">This client has no projects yet.</p>}
                  {projects.map((p) => (
                    <label key={p.projectId} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="h-4 w-4 accent-primary" checked={form.projects.includes(p.projectId)} onChange={() => toggleProject(p.projectId)} />
                      <span>{p.projectName} <span className="text-text-secondary">· {p.projectId}</span></span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title="Remove contact"
        size="md"
        showHeaderIcon={false}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={saving}>Cancel</Button>
            <Button variant="danger" onClick={() => run(() => api.delete(`${base}/${confirm.id}`), `${confirm.name} removed`)} loading={saving}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Remove <strong>{confirm?.name}</strong> ({confirm?.phone})? They are signed out on their next tap and stop getting
          notifications. Orders they placed keep their name.
        </p>
      </Modal>
    </div>
  );
}
