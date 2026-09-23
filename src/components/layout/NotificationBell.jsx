import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, ICON_NAMES } from "../icons";
import notificationService from "../../services/notificationService";
import { getSocket, onSocketEvent } from "../../services/socket";

/**
 * Navbar notification bell for the admin panel.
 *
 * Feeds on GET /admin/notifications and stays live through the shared
 * WebSocket: the backend's notifyAdmins() emits a `notification` event to every
 * signed-in admin, so a new order or a client message lands here without a
 * refresh. The socket is the primary path; the 60s poll below is only a safety
 * net for a dropped connection.
 *
 * The feed is shared by all admins (see ADMIN_TARGET_ID in the backend), so
 * "mark all read" clears it for the whole back office, not just this browser.
 */

const PAGE_SIZE = 20;
const POLL_MS = 60_000;

/** "2m ago" / "3h ago" / "5d ago" — compact enough for a dropdown row. */
function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

/** Notification type -> left accent colour, so the list scans at a glance. */
function accentFor(type) {
  switch (type) {
    case "ORDER_CREATED":
      return "bg-green-500";
    case "STATUS_UPDATED":
      return "bg-blue-500";
    case "COMMENT_ADDED":
      return "bg-amber-500";
    default:
      return "bg-gray-400";
  }
}

const NotificationBell = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const panelRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.list({ limit: PAGE_SIZE });
      setItems(Array.isArray(res?.data) ? res.data : []);
      setUnread(res?.unreadCount ?? 0);
    } catch {
      // A failed poll must not break the navbar — keep whatever is on screen.
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + slow poll as a fallback for a dropped socket.
  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // Live updates. getSocket() reuses the one shared connection, so this does
  // not open a second WebSocket alongside the order-details page.
  useEffect(() => {
    getSocket();
    const off = onSocketEvent("notification", (msg) => {
      const row = msg?.data;
      if (!row?.id) return;
      setItems((prev) =>
        prev.some((n) => n.id === row.id) ? prev : [row, ...prev].slice(0, PAGE_SIZE),
      );
      setUnread((n) => n + 1);
    });
    return off;
  }, []);

  // Close on an outside click / Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) load(); // Opening is the moment the list most needs to be current.
  };

  const handleMarkAllRead = async () => {
    // Optimistic: the bell should clear instantly, and a failed request only
    // means the next poll restores the true count.
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    try {
      await notificationService.markAllRead();
    } catch {
      load();
    }
  };

  const handleClick = async (n) => {
    setOpen(false);

    if (!n.isRead) {
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
      );
      setUnread((c) => Math.max(0, c - 1));
      try {
        await notificationService.markRead(n.id);
      } catch {
        load();
      }
    }

    // The route takes the human order code (ORD-2025-0001). `orderId` on the
    // row is the database cuid, which would 404 — so only navigate when the
    // backend supplied orderCode alongside it.
    if (n.orderCode) navigate(`/orders/${n.orderCode}`);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={toggle}
        aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
        className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative"
      >
        <Icon name={ICON_NAMES.NOTIFICATION} size={30} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[400px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                Notifications
              </span>
              {unread > 0 && (
                <span className="text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {loading && items.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">
                Loading…
              </p>
            )}

            {!loading && items.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-gray-700">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  New orders, status changes and messages will show up here.
                </p>
              </div>
            )}

            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 flex gap-3 ${
                  n.isRead ? "" : "bg-blue-50/40"
                }`}
              >
                <span
                  className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${accentFor(n.type)}`}
                />
                <span className="flex-1 min-w-0">
                  <span className="flex items-baseline justify-between gap-2">
                    <span
                      className={`text-sm truncate ${
                        n.isRead
                          ? "text-gray-700 font-medium"
                          : "text-gray-900 font-semibold"
                      }`}
                    >
                      {n.title}
                    </span>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </span>
                  <span className="block text-xs text-gray-600 mt-0.5 line-clamp-2">
                    {n.message}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
