"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Sesuaikan dengan URL Gateway NestJS kamu
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    const socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      transports: ["websocket"], // Memaksa langsung pakai WebSocket tanpa HTTP Polling lama
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("WebSocket Terhubung di Next.js!");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("WebSocket Terputus!");
    });

    setSocket(socketInstance);

    // Bersihkan koneksi saat aplikasi di-close / unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
