"use client";

import { io, Socket } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

let socket: Socket | null = null;

export function getSocket(token: string) {
  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false
    });
  }
  if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }
  return socket;
}
