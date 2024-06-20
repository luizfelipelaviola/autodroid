import { EventEmitter } from "node:stream";

// Type import
import { WebsocketServer } from "./types";

class WebsocketAdapterClass {
  private bus: EventEmitter;
  public readonly initialization: Promise<void>;

  private websocketServer: WebsocketServer;

  public async getServer(): Promise<WebsocketServer> {
    await this.initialization;
    return this.websocketServer;
  }

  constructor() {
    this.bus = new EventEmitter();
    this.initialization = new Promise(resolve => {
      this.bus.on("initialized", resolve);
    });
  }

  public initialize(server: WebsocketServer): void {
    this.websocketServer = server;
    this.bus.emit("initialized");
  }
}

const WebsocketAdapter = new WebsocketAdapterClass();
export { WebsocketAdapter };
