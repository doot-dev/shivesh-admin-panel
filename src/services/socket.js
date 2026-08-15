/**
 * Realtime client for the admin panel — live order comments and status changes.
 *
 * Talks to the backend's WebSocket hub at `/ws` (see
 * shivesh-backend/src/realtime/socketServer.js). That hub is plain `ws`, NOT
 * socket.io: an earlier version of this file used socket.io-client, which could
 * never connect because socket.io adds its own handshake and framing on top of
 * the WebSocket. Keep this file on the raw protocol below unless the backend
 * itself changes.
 *
 * Wire protocol (JSON both ways):
 *   -> { type: 'subscribe',   orderId }   join an order room
 *   -> { type: 'unsubscribe', orderId }
 *   <- { type: 'comment:new',  orderId, data }
 *   <- { type: 'order:status', orderId, data: { status, deliveryStatus } }
 *
 * A single connection is shared by the whole session; pages join and leave
 * individual order rooms on top of it rather than opening their own sockets.
 */
import api from './api';
import { localStorageKeys } from '../constant/constant';

let socket = null;

/** Rooms we believe we are in, so a reconnect can restore them. */
const rooms = new Set();

/** type -> Set<handler> */
const listeners = new Map();

let reconnectAttempts = 0;
let reconnectTimer = null;
let manuallyClosed = false;

/** http://host:3001 -> ws://host:3001/ws, carrying the REST token. */
function buildUrl() {
  const base = api.defaults.baseURL || '';
  const wsBase = base.replace(/^http/i, 'ws').replace(/\/+$/, '');
  const token = localStorage.getItem(localStorageKeys.accessToken) || '';
  // A browser cannot set headers on a WebSocket handshake, so the token rides
  // in the query string — the backend accepts it there for exactly this reason.
  return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
}

function emit(type, payload) {
  const handlers = listeners.get(type);
  if (!handlers) return;
  for (const handler of handlers) {
    try {
      handler(payload);
    } catch (err) {
      console.error(`socket handler for "${type}" threw:`, err);
    }
  }
}

function send(message) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    return true;
  }
  return false;
}

function scheduleReconnect() {
  if (manuallyClosed || reconnectTimer) return;
  // Backoff caps at 30s so a backend restart does not turn into a request storm.
  const delay = Math.min(1000 * 2 ** reconnectAttempts, 30_000);
  reconnectAttempts += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }

  const token = localStorage.getItem(localStorageKeys.accessToken);
  if (!token) return null; // Logged out — nothing to authenticate with.

  manuallyClosed = false;
  socket = new WebSocket(buildUrl());

  socket.onopen = () => {
    reconnectAttempts = 0;
    // Re-join every room after a drop, otherwise the page looks connected but
    // silently receives nothing.
    for (const orderId of rooms) send({ type: 'subscribe', orderId });
    emit('__open', null);
  };

  socket.onmessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }
    if (msg?.type) emit(msg.type, msg);
  };

  socket.onclose = (event) => {
    emit('__close', event);
    // 4401 is the backend's "unauthorized" close: retrying with the same bad
    // token would just loop, so stop until something calls connect() again.
    if (event.code === 4401) {
      manuallyClosed = true;
      return;
    }
    scheduleReconnect();
  };

  socket.onerror = () => {
    // onclose always follows, which is where reconnect is handled.
  };

  return socket;
}

/** Open (or reuse) the shared connection. */
export function getSocket() {
  return connect();
}

/** Subscribe to a backend event type. Returns an unsubscribe function. */
export function onSocketEvent(type, handler) {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type).add(handler);
  return () => offSocketEvent(type, handler);
}

export function offSocketEvent(type, handler) {
  listeners.get(type)?.delete(handler);
}

export function joinOrderRoom(orderId) {
  if (!orderId) return;
  rooms.add(orderId);
  connect();
  send({ type: 'subscribe', orderId });
}

export function leaveOrderRoom(orderId) {
  if (!orderId) return;
  rooms.delete(orderId);
  send({ type: 'unsubscribe', orderId });
}

/** Tear down on logout so the next user does not inherit this session's socket. */
export function closeSocket() {
  manuallyClosed = true;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  rooms.clear();
  listeners.clear();
  socket?.close();
  socket = null;
}
