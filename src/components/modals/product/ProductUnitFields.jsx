// W38: Shivesh sells many materials — each product has its own unit, and only
// concrete gets cube tests / "TM" wording.
const PRODUCT_UNITS = ['CBM', 'NOS', 'MT', 'KG', 'BAG', 'RMT', 'SQM', 'LTR'];

export default function ProductUnitFields({ formData, onChange, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
        <select
          value={formData.unit || 'CBM'}
          onChange={(e) => onChange('unit', e.target.value)}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          {PRODUCT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
        <input
          type="checkbox"
          checked={formData.isConcrete ?? true}
          onChange={(e) => onChange('isConcrete', e.target.checked)}
          disabled={disabled}
        />
        Concrete (enables cube tests)
      </label>
    </div>
  );
}
