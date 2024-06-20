import { Server } from "socket.io";

// DTO import
import { Session } from "@modules/user/types/IUserSession.dto";

export interface ServerToClientEvents {
  pong: () => void;
}

export interface ClientToServerEvents {
  ping: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  session: Session;
}

export type WebsocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
