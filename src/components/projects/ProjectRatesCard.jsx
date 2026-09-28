import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import Button from "../ui/Button";
import usePermission from "../../hooks/usePermission";

// PO rates for extra services (2026-09-29): prefilled when someone adds
// pumping or a part-load charge to an order of this project.
const inr = (n) => (n || n === 0 ? `₹${Number(n).toLocaleString("en-IN")}` : "Not set");

export default function ProjectRatesCard({ project, onSaved }) {
  const { canKey } = usePermission();
  const [edit, setEdit] = useState(null);
  const save = async () => {
    try {
      await api.put("/api/v1/admin/project", { projectId: project.projectId, pumpingRate: edit.pumpingRate, partLoadRate: edit.partLoadRate });
      toast.success("PO rates saved");
      setEdit(null);
      onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not save");
    }
  };
  const input = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Extra services (PO rates)</h2>
          <p className="text-sm text-gray-500">Used as the default price when pumping or part load is added to an order.</p>
        </div>
        {canKey("projects.update") && !edit && (
          <Button variant="primary" onClick={() => setEdit({ pumpingRate: project.pumpingRate ?? "", partLoadRate: project.partLoadRate ?? "" })}>Edit</Button>
        )}
      </div>
      {edit ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-gray-600">Pumping, per pour (₹)
            <input type="number" min="0" className={input} value={edit.pumpingRate} onChange={(e) => setEdit({ ...edit, pumpingRate: e.target.value })} />
          </label>
          <label className="text-sm text-gray-600">Part load, per truck (₹)
            <input type="number" min="0" className={input} value={edit.partLoadRate} onChange={(e) => setEdit({ ...edit, partLoadRate: e.target.value })} />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button>
            <Button variant="primary" onClick={save}>Save</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div><p className="text-gray-500">Pumping, per pour</p><p className="text-lg font-semibold text-gray-900">{inr(project.pumpingRate)}</p></div>
          <div><p className="text-gray-500">Part load, per truck</p><p className="text-lg font-semibold text-gray-900">{inr(project.partLoadRate)}</p></div>
        </div>
      )}
    </div>
  );
}
