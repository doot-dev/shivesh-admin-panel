import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { openFile } from '../../utils/fileLink';

/**
 * Challan + review controls for one truck, used on the ORDER page (W11) so the
 * office can upload the pink slip and accept/reject before any bill exists.
 * "Reject" here is the office rejecting — including on the client's behalf.
 */
export default function TruckReviewActions({ tm, disabled, onUploadChallan, onReview }) {
  const fileRef = useRef(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [part, setPart] = useState(null); // { qty, reason } while editing a part rejection
  const rejected = tm.approvalStatus === 'REJECTED';
  const kept = Math.max(0, Number(tm.qty) - (tm.rejectedQty || 0));

  // Part rejection: some CBM wasted / refused at site, the rest is billed.
  const submitPart = () => {
    const q = part.qty === '' ? null : Number(part.qty);
    if (q !== null && !(q > 0 && q < Number(tm.qty))) return toast.error(`Rejected qty must be more than 0 and less than ${tm.qty}.`);
    if (q !== null && !part.reason.trim()) return toast.error('A reason is required.');
    onReview(tm.id, { approvalStatus: tm.approvalStatus, rejectedQty: q, rejectionReason: part.reason.trim() });
    setPart(null);
  };

  const submitReject = () => {
    if (!reason.trim()) return toast.error('A rejection reason is required.');
    onReview(tm.id, { approvalStatus: 'REJECTED', rejectionReason: reason.trim() });
    setRejecting(false);
    setReason('');
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {!rejected && !tm.challanUrl && (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Photo missing</span>
        )}
        {tm.status === 'REACHED' && (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Reached site</span>
        )}
        {tm.challanUrl && (
          <button type="button" onClick={() => openFile(tm.challanUrl)} className="text-primary font-medium hover:underline">
            View challan
          </button>
        )}
        {!disabled && !rejected && (
          <>
            <button type="button" onClick={() => fileRef.current?.click()} className="text-primary font-medium hover:underline">
              {tm.challanUrl ? 'Replace challan photo' : 'Upload challan photo'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadChallan(tm.id, f);
                e.target.value = '';
              }}
            />
          </>
        )}
        {!disabled && tm.approvalStatus === 'PENDING' && !rejecting && (
          <>
            <button
              type="button"
              onClick={() => onReview(tm.id, { approvalStatus: 'ACCEPTED' })}
              disabled={!tm.challanUrl || !tm.challanNo}
              title={!tm.challanUrl || !tm.challanNo ? 'Needs a challan no. and photo first' : ''}
              className="text-green-700 font-medium hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              Accept
            </button>
            <button type="button" onClick={() => setPart({ qty: tm.rejectedQty ?? '', reason: tm.rejectedQty ? tm.rejectionReason ?? '' : '' })} className="text-amber-700 font-medium hover:underline">
              {tm.rejectedQty ? 'Edit part reject' : 'Part reject'}
            </button>
            <button type="button" onClick={() => setRejecting(true)} className="text-red-600 font-medium hover:underline">
              Reject (for client)
            </button>
          </>
        )}
      </div>
      {rejected && (
        <p className="text-xs text-red-600">
          Rejected{tm.rejectedByType === 'CLIENT' ? ' by client at site' : tm.rejectedByType === 'USER' ? ' by office' : ''}: {tm.rejectionReason}
        </p>
      )}
      {!rejected && tm.rejectedQty > 0 && (
        <p className="text-xs text-amber-700">
          Kept {kept} of {tm.qty} · {tm.rejectedQty} rejected{tm.rejectedByType === 'CLIENT' ? ' by client at site' : tm.rejectedByType === 'USER' ? ' by office' : ''}: {tm.rejectionReason}
        </p>
      )}
      {part && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            autoFocus
            type="number" min="0" step="0.1"
            value={part.qty}
            onChange={(e) => setPart({ ...part, qty: e.target.value })}
            placeholder="Wasted CBM"
            className="w-28 text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
          />
          <input
            value={part.reason}
            onChange={(e) => setPart({ ...part, reason: e.target.value })}
            placeholder="Reason (e.g. 1 CBM wasted, pump choke)"
            className="flex-1 min-w-40 text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
          />
          <button type="button" onClick={submitPart} className="text-xs font-medium text-amber-700 hover:underline">Save</button>
          <button type="button" onClick={() => setPart(null)} className="text-xs text-gray-500 hover:underline">Cancel</button>
          <span className="w-full text-xs text-gray-500">Leave the qty empty to clear it. Billed qty = {tm.qty} − wasted.</span>
        </div>
      )}
      {rejecting && (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (e.g. slump not OK, damaged)"
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
          />
          <button type="button" onClick={submitReject} className="text-xs font-medium text-red-600 hover:underline">Confirm</button>
          <button type="button" onClick={() => { setRejecting(false); setReason(''); }} className="text-xs text-gray-500 hover:underline">Cancel</button>
        </div>
      )}
    </div>
  );
}
