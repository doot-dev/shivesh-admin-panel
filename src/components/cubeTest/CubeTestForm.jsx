import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FileText, Image as ImageIcon, Paperclip, Trash2, X } from 'lucide-react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Dropdown from '../ui/Dropdown';
import {
  CUBE_TEST_PERIODS,
  CUBE_TEST_PERIOD_DAYS,
  CUBE_TEST_PERIOD_LABEL,
  addDaysToDateTime,
  combineDateTime,
  todayDateStr,
  addedByText,
} from '../../utils/cubeTest';
import { fileLink } from '../../utils/fileLink';
import orderService from '../../services/orderService';

export const FieldLabel = ({ children }) => (
  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
    {children}
  </label>
);

const MAX_FILES = 10; // per save: the backend's limit
const MAX_BYTES = 10 * 1024 * 1024;

const shortDate = (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

/** A cube test's files, each opening in a new tab. Pass onRemove to show a remove button. */
export const CubeTestAttachments = ({ attachments = [], onRemove, removingId }) => (
  <ul className="space-y-1.5">
    {attachments.map((a) => {
      const name = a.fileName || a.fileUrl?.split('/').pop() || 'File';
      const by = addedByText(a);
      // Backfilled rows have no mimeType, so fall back to the extension.
      const FileIcon = a.mimeType?.startsWith('image/') || /\.(jpe?g|png)$/i.test(a.fileUrl || '') ? ImageIcon : FileText;
      return (
        <li key={a.id} className="flex items-center gap-2 rounded-lg border border-primary-light bg-white px-3 py-2">
          <FileIcon size={16} className="shrink-0 text-primary" aria-hidden="true" />
          <a href={fileLink(a.fileUrl)} target="_blank" rel="noopener noreferrer" className="group min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-primary group-hover:underline">{name}</span>
            <span className="block text-xs text-text-secondary">
              {[by && `Added by ${by}`, shortDate(a.createdAt)].filter(Boolean).join(' · ')}
            </span>
          </a>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(a)}
              disabled={removingId === a.id}
              aria-label={`Remove ${name}`}
              className="shrink-0 rounded-md p-1.5 text-text-secondary hover:bg-error-light hover:text-error disabled:opacity-50"
            >
              <Trash2 size={15} />
            </button>
          )}
        </li>
      );
    })}
  </ul>
);

/**
 * Add/edit form. When editing, pass `cubeTest` (with its attachments), the order
 * code as `orderId` and `onCubeTestChange`: removing a saved file happens right
 * away and hands back the updated test.
 */
const CubeTestForm = ({ form, onChange, onSave, onCancel, saving, valid, cubeTest, orderId, onCubeTestChange }) => {
  const [removingId, setRemovingId] = useState(null);
  // An old 14/21-day test still shows its period (kept on save unless changed).
  const legacyPeriod = form.period && !CUBE_TEST_PERIODS.some((p) => p.value === form.period);
  const periodOptions = [
    { value: '', label: 'Select period' },
    ...CUBE_TEST_PERIODS,
    ...(legacyPeriod ? [{ value: form.period, label: CUBE_TEST_PERIOD_LABEL[form.period] || form.period }] : []),
  ];
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

  const pickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ''; // lets the same file be picked again after removing it
    const tooBig = picked.filter((f) => f.size > MAX_BYTES);
    if (tooBig.length) toast.error(`Over 10 MB, skipped: ${tooBig.map((f) => f.name).join(', ')}`);
    const next = [...form.files, ...picked.filter((f) => f.size <= MAX_BYTES)];
    if (next.length > MAX_FILES) toast.error(`Up to ${MAX_FILES} files per save`);
    onChange('files', next.slice(0, MAX_FILES));
  };

  const removeSaved = async (a) => {
    if (!window.confirm(`Remove "${a.fileName || 'this file'}" from the cube test?`)) return;
    setRemovingId(a.id);
    try {
      const res = await orderService.deleteCubeTestAttachment(orderId, cubeTest.id, a.id);
      toast.success('File removed');
      onCubeTestChange?.(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove file');
    } finally {
      setRemovingId(null);
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
      </div>

      <div className="mt-4">
        <FieldLabel>Result files (optional)</FieldLabel>
        {cubeTest?.attachments?.length > 0 && (
          <div className="mb-3">
            <CubeTestAttachments attachments={cubeTest.attachments} onRemove={removeSaved} removingId={removingId} />
          </div>
        )}
        {/* The picked files are listed below, so the native "No file chosen" text is hidden. */}
        <label className={`inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary focus-within:ring-2 focus-within:ring-primary ${periodChosen ? 'cursor-pointer hover:bg-primary/20' : 'cursor-not-allowed opacity-50'}`}>
          <Paperclip size={15} aria-hidden="true" />
          Add files
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={!periodChosen}
            onChange={pickFiles}
            className="sr-only"
          />
        </label>
        <p className="mt-1.5 text-xs text-text-secondary">
          PDF, JPG or PNG, up to 10 MB each. {cubeTest?.attachments?.length ? 'New files are added to the ones above.' : 'You can add more later.'}
        </p>
        {form.files.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {form.files.map((f, i) => (
              <li key={`${f.name}-${f.lastModified}-${i}`} className="flex items-center gap-2 rounded-lg border border-dashed border-primary-bg-alt bg-white px-3 py-2 text-sm">
                <Paperclip size={14} className="shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => onChange('files', form.files.filter((_, j) => j !== i))}
                  aria-label={`Don't upload ${f.name}`}
                  className="shrink-0 rounded-md p-1 text-text-secondary hover:bg-error-light hover:text-error"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
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
