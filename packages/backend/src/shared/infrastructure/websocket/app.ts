import { Redis } from "ioredis";
import { Server } from "node:http";
import { Server as SocketIoServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

// Configuration import
import { getRedisConfig } from "@config/redis";
import { getCorsConfig } from "@config/cors";

// Middleware import
import { websocketAuthenticationMiddleware } from "./middlewares/websocketAuthentication.middleware";

// Type import
import { WebsocketServer } from "./types";

// Adapter import
import { WebsocketAdapter } from "./adapter";

class WebsocketApp {
  public readonly initialization: Promise<void>;

  public readonly server: WebsocketServer;
  private readonly pubClient: Redis;
  private readonly subClient: Redis;

  constructor(httpServer: Server) {
    this.initialization = Promise.resolve();

    this.server = new SocketIoServer(httpServer, {
      path: "/websocket",
      cors: {
        origin: getCorsConfig().origin,
      },
    });
    this.pubClient = new Redis(getRedisConfig());
    this.subClient = this.pubClient.duplicate();

    this.server.adapter(createAdapter(this.pubClient, this.subClient) as any);

    this.middlewares();

    this.server.on("connection", socket => {
      socket.on("ping", () => {
        socket.emit("pong");
      });
    });

    WebsocketAdapter.initialize(this.server);
  }

  private middlewares(): void {
    this.server.use(websocketAuthenticationMiddleware);

    // USER: create a room for him
    this.server.use((socket, next) => {
      if (socket.data.session?.user.id)
        socket.join(`user:${socket.data.session.user.id}`);
      next();
    });
  }
}

export { WebsocketApp };
