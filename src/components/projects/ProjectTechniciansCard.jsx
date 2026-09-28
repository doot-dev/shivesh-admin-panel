import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import orderService from "../../services/orderService";
import Button from "../ui/Button";
import usePermission from "../../hooks/usePermission";

// Field technicians on a project (2026-09-28): each one sees every order of
// the project in the field app and gets a push when a new order is placed.
export default function ProjectTechniciansCard({ projectId, technicians = [], onSaved }) {
  const { can } = usePermission();
  const current = technicians.map((t) => t.user);
  const [editing, setEditing] = useState(false);
  const [all, setAll] = useState([]);
  const [picked, setPicked] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    setPicked(new Set(current.map((u) => u.id)));
    orderService.getFieldTechs().then((r) => setAll(r.data || [])).catch(() => toast.error("Could not load field technicians"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const toggle = (id) => setPicked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/api/v1/admin/project/${projectId}/technicians`, { userIds: [...picked] });
      toast.success("Field technicians updated");
      setEditing(false);
      onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Field technicians</h2>
          <p className="text-sm text-gray-500">They see every order of this project and get a push on each new one.</p>
        </div>
        {can("projects", "update") && !editing && <Button variant="primary" onClick={() => setEditing(true)}>Edit</Button>}
      </div>

      {!editing && (current.length ? (
        <div className="flex flex-wrap gap-2">
          {current.map((u) => (
            <span key={u.id} className="rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
              {u.name}{u.phone ? ` · ${u.phone}` : ""}
            </span>
          ))}
        </div>
      ) : <p className="text-sm text-gray-500">No field technicians yet.</p>)}

      {editing && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
            {all.map((t) => (
              <label key={t.id} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={picked.has(t.id)} onChange={() => toggle(t.id)} />
                <span>{t.name} <span className="text-gray-400">({t.employeeId})</span></span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </>
      )}
    </div>
  );
}
