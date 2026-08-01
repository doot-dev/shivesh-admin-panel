import { useEffect } from 'react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Dropdown from '../ui/Dropdown';
import {
  CUBE_TEST_PERIODS,
  CUBE_TEST_PERIOD_DAYS,
  addDaysToDateTime,
  combineDateTime,
  todayDateStr,
} from '../../utils/cubeTest';

export const FieldLabel = ({ children }) => (
  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
    {children}
  </label>
);

const CubeTestForm = ({ form, onChange, onSave, onCancel, saving, valid }) => {
  const periodOptions = [{ value: '', label: 'Select period' }, ...CUBE_TEST_PERIODS];
  const isCustom = form.period === 'CUSTOM';
  const standardDays = CUBE_TEST_PERIOD_DAYS[form.period];
  const periodChosen = Boolean(form.period);

  // For 7/14/21-day periods the server computes the test date — keep the "to" pickers
  // in sync with castingDate/period so they show it, but leave them disabled (not user-editable).
  useEffect(() => {
    if (!standardDays) return;
    const next = addDaysToDateTime(form.castingDate, form.castingTime, standardDays);
    onChange('toDate', next.date);
    onChange('toTime', next.time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.castingDate, form.castingTime, form.period]);

  const handlePeriodChange = (v) => {
    onChange('period', v);
    // Whatever was auto-filled/typed for the previous period no longer applies.
    if (v === 'CUSTOM') {
      onChange('toDate', '');
      onChange('toTime', '');
    }
  };

  const castingCombined = combineDateTime(form.castingDate, form.castingTime);
  const customCombined = combineDateTime(form.toDate, form.toTime);
  const customBeforeCasting = isCustom && castingCombined && customCombined && new Date(customCombined) < new Date(castingCombined);
  const customInFuture = isCustom && customCombined && new Date(customCombined) > new Date();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <FieldLabel>Period</FieldLabel>
          <Dropdown
            options={periodOptions}
            value={form.period}
            placeholder="Select period"
            width="100%"
            height="40px"
            onChange={handlePeriodChange}
          />
        </div>
        <Input
          label="Casting Date"
          type="date"
          disabled={!periodChosen}
          value={form.castingDate}
          onChange={(e) => onChange('castingDate', e.target.value)}
        />
        <Input
          label="Casting Time"
          type="time"
          disabled={!periodChosen}
          value={form.castingTime}
          onChange={(e) => onChange('castingTime', e.target.value)}
        />
        <Input
          label="Quantity"
          disabled={!periodChosen}
          value={form.quantity}
          onChange={(e) => onChange('quantity', e.target.value)}
        />

        <div>
          <Input
            label={isCustom ? 'Test Date' : 'Test Date (auto)'}
            type="date"
            min={isCustom ? form.castingDate || undefined : undefined}
            max={isCustom ? todayDateStr() : undefined}
            disabled={!isCustom}
            value={form.toDate}
            onChange={(e) => onChange('toDate', e.target.value)}
          />
        </div>
        <Input
          label={isCustom ? 'Test Time' : 'Test Time (auto)'}
          type="time"
          disabled={!isCustom}
          value={form.toTime}
          onChange={(e) => onChange('toTime', e.target.value)}
        />

        <div>
          <FieldLabel>Report File (optional)</FieldLabel>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={!periodChosen}
            onChange={(e) => onChange('file', e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
          />
        </div>
      </div>

      {(customBeforeCasting || customInFuture) && (
        <p className="mt-2 text-xs text-red-600">
          {customBeforeCasting
            ? 'Test date/time cannot be before the casting date/time.'
            : 'Test date/time cannot be in the future.'}
        </p>
      )}

      <div className="flex justify-end gap-2 mt-3">
        <Button type="button" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="button" variant="primary" onClick={onSave} disabled={saving || !valid}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default CubeTestForm;
