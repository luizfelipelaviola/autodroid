/* eslint-disable no-param-reassign */
import { Socket } from "socket.io";
import { container } from "tsyringe";

// Service import
import { HandleAuthenticationService } from "@modules/authentication/services/handleAuthentication.service";

// Type import
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../types";

export const websocketAuthenticationMiddleware = async (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  next: (err?: Error) => void,
): Promise<void> => {
  const { auth } = socket.handshake;

  if (auth?.token) {
    const [, access_token] = auth.token.split(" ");

    try {
      const handleUserAuthenticationService = container.resolve(
        HandleAuthenticationService,
      );

      const session = await handleUserAuthenticationService.execute({
        allow_existing_only: true,
        access_token,
        language: (socket.request as any).language,
      });

      socket.data.session = session;

      next();
    } catch {
      next(new Error("unauthorized"));
    }
  }

  if (socket.data.session) next();
  else next(new Error("unauthorized"));
};
