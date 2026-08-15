import { io } from 'socket.io-client';
import api from './api';
import { localStorageKeys } from '../constant/constant';

// Single shared connection for the whole admin panel session — pages join/leave
// individual order rooms on top of it rather than opening their own sockets.
let socket = null;

export function getSocket() {
  if (socket) return socket;

  socket = io(api.defaults.baseURL, {
    auth: { token: localStorage.getItem(localStorageKeys.accessToken) },
    transports: ['websocket'],
  });

  return socket;
}

export function joinOrderRoom(orderId) {
  getSocket().emit('order:join', { orderId });
}

export function leaveOrderRoom(orderId) {
  socket?.emit('order:leave', { orderId });
}
