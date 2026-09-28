import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Camera, Mic, Send, Square } from "lucide-react";
import api from "../services/api";
import leadService from "../services/leadService";
import usePermission from "../hooks/usePermission";
import { fileLink, openFile } from "../utils/fileLink";

// Lead management as a chat (2026-09-28): everyone working the lead posts
// notes, voice notes and site photos to one thread. Status and owner changes
// show up in the same thread as event lines.
const STATUSES = ["NEW", "IN_PROGRESS", "CONVERTED", "LOST"];
const label = (s) => s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ");
const BASE = "/api/v1/admin/leads";
const errMsg = (e, f) => e?.response?.data?.message || e?.response?.data?.error || f;

export default function LeadsDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canKey, user } = usePermission();
  const canWrite = canKey("leads.update");
  const [lead, setLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(null); // { recorder, startedAt }
  const [seconds, setSeconds] = useState(0);
  const bottomRef = useRef(null);
  const photoRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      setMessages((await api.get(`${BASE}/${id}/messages`)).data.data ?? []);
    } catch (e) {
      toast.error(errMsg(e, "Could not load the chat"));
    }
  }, [id]);

  useEffect(() => {
    leadService.getLeadsById(id).then((r) => setLead(r.data)).catch(() => toast.error("Could not load the lead"));
    api.get("/api/v1/admin/user/all").then((r) => setUsers(r.data.data ?? [])).catch(() => {});
    loadMessages();
    // ponytail: poll every 15 s while open; move to the socket if chats get busy.
    const t = setInterval(loadMessages, 15000);
    return () => clearInterval(t);
  }, [id, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!recording) return undefined;
    const t = setInterval(() => setSeconds(Math.round((Date.now() - recording.startedAt) / 1000)), 500);
    return () => clearInterval(t);
  }, [recording]);

  const post = async ({ file, durationSec } = {}) => {
    if (!file && !text.trim()) return;
    const form = new FormData();
    if (text.trim() && !file) form.append("text", text.trim());
    if (file) form.append("file", file);
    if (durationSec) form.append("durationSec", String(durationSec));
    setSending(true);
    try {
      const { data } = await api.post(`${BASE}/${id}/messages`, form, { headers: { "Content-Type": "multipart/form-data" } });
      setMessages((m) => [...m, data.data]);
      if (!file) setText("");
    } catch (e) {
      toast.error(errMsg(e, "Could not send"));
    } finally {
      setSending(false);
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      recording.recorder.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      const startedAt = Date.now();
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(null);
        setSeconds(0);
        const type = (recorder.mimeType || "audio/webm").split(";")[0];
        const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
        const blob = new Blob(chunks, { type });
        if (blob.size) post({ file: new File([blob], `voice-note.${ext}`, { type }), durationSec: Math.round((Date.now() - startedAt) / 1000) });
      };
      recorder.start();
      setRecording({ recorder, startedAt });
    } catch {
      toast.error("Allow the microphone to record a voice note");
    }
  };

  const updateLead = async (patch) => {
    try {
      await api.put(`${BASE}/log?leadId=${id}`, patch);
      setLead((l) => ({ ...l, ...patch }));
      loadMessages();
    } catch (e) {
      toast.error(errMsg(e, "Could not update the lead"));
    }
  };

  const fields = lead && [
    ["Contact", lead.contactPerson], ["Phone", lead.phone], ["Email", lead.email], ["Address", lead.address],
    ["Requirement", lead.requirement], ["Source", lead.source && label(lead.source)],
    ["Follow-up", lead.date ? `${dayjs(lead.date).format("DD MMM YYYY")}${lead.time ? ` · ${lead.time}` : ""}` : null],
  ].filter(([, v]) => v);

  return (
    <div className="p-4 md:p-8">
      <button type="button" onClick={() => navigate("/leads")} className="text-sm text-text-secondary hover:underline">← Leads</button>
      <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lead card */}
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5">
          <h1 className="text-xl font-semibold text-gray-900">{lead?.companyName ?? "…"}</h1>
          {lead?.title && <p className="mt-1 text-sm text-text-secondary">{lead.title}</p>}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-text-secondary">Status
              <select disabled={!canWrite} value={lead?.status ?? ""} onChange={(e) => updateLead({ status: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900">
                {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-text-secondary">Owner
              <select disabled={!canWrite} value={lead?.assignedToId ?? ""} onChange={(e) => updateLead({ assignedToId: e.target.value ? Number(e.target.value) : null })}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900">
                <option value="">Unassigned</option>
                {users.filter((u) => u.status !== false).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            {fields?.map(([k, v]) => (
              <div key={k} className="flex gap-3"><dt className="w-24 shrink-0 text-text-secondary">{k}</dt><dd className="break-words text-gray-900">{v}</dd></div>
            ))}
          </dl>
          {lead?.description && <p className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{lead.description}</p>}
        </aside>

        {/* Chat */}
        <section className="flex h-[calc(100vh-10rem)] min-h-[420px] flex-col rounded-2xl border border-gray-200 bg-white lg:col-span-2">
          <header className="border-b border-gray-100 px-5 py-3">
            <h2 className="font-semibold text-gray-900">Follow-up</h2>
            <p className="text-xs text-text-secondary">Notes, voice notes and site photos from the team.</p>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
            {messages.length === 0 && <p className="py-10 text-center text-sm text-text-secondary">No follow-ups yet. Write the first one below.</p>}
            {messages.map((m) => {
              if (m.kind === "EVENT") {
                return <p key={m.id} className="text-center text-xs text-text-secondary">{m.text} · {m.author?.name} · {dayjs(m.createdAt).format("DD MMM, h:mm A")}</p>;
              }
              const mine = m.author?.id === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine ? "bg-primary text-white" : "bg-white text-gray-900"}`}>
                    {!mine && <p className="mb-0.5 text-xs font-semibold text-primary">{m.author?.name}</p>}
                    {m.kind === "PHOTO" && (
                      <button type="button" onClick={() => openFile(m.fileUrl)} className="block">
                        <img src={fileLink(m.fileUrl)} alt="Site photo" className="max-h-64 rounded-lg object-cover" loading="lazy" />
                      </button>
                    )}
                    {m.kind === "VOICE" && <audio controls preload="none" src={fileLink(m.fileUrl)} className="w-64 max-w-full" />}
                    {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                    <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-text-secondary"}`}>
                      {dayjs(m.createdAt).format("DD MMM, h:mm A")}{m.durationSec ? ` · ${m.durationSec}s` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          {canWrite ? (
            <footer className="flex items-end gap-2 border-t border-gray-100 p-3">
              <input ref={photoRef} type="file" accept="image/*" capture="environment" hidden
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) post({ file: f }); }} />
              <button type="button" aria-label="Attach a site photo" disabled={sending || Boolean(recording)} onClick={() => photoRef.current?.click()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 text-text-secondary hover:bg-gray-50 disabled:opacity-50"><Camera size={20} /></button>
              {recording ? (
                <div className="flex h-11 flex-1 items-center gap-2 rounded-2xl bg-error-light px-4 text-sm font-medium text-error">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-error" /> Recording… {seconds}s — tap stop to send
                </div>
              ) : (
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="Write a follow-up…"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); post(); } }}
                  className="max-h-40 min-h-11 flex-1 resize-y rounded-2xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
              )}
              {text.trim() && !recording ? (
                <button type="button" aria-label="Send" disabled={sending} onClick={() => post()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-second disabled:opacity-50"><Send size={18} /></button>
              ) : (
                <button type="button" aria-label={recording ? "Stop and send the voice note" : "Record a voice note"} disabled={sending} onClick={toggleRecording}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-50 ${recording ? "bg-error" : "bg-primary hover:bg-primary-second"}`}>
                  {recording ? <Square size={16} /> : <Mic size={20} />}
                </button>
              )}
            </footer>
          ) : (
            <p className="border-t border-gray-100 p-3 text-center text-xs text-text-secondary">You can read this chat. Posting needs the Leads update permission.</p>
          )}
        </section>
      </div>
    </div>
  );
}
