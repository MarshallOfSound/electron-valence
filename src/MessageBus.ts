import * as electron from 'electron';
import { EventEmitter2 } from 'eventemitter2';

export const FRAME_MESSAGE_PREFIX = 'ELECTRON_CONTEXT_BRIDGE_INTERNAL_MESSAGE_PREFIX::';
export const IPC_MESSAGE_CHANNEL = 'ELECTRON_CONTEXT_BRIDGE_INTERNAL_MESSAGE_CHANNEL';

export type MessageHandler = (message: string) => void;

export interface IMessageBus {
  sendMessage(message: string): void;
  onMessage(handler: MessageHandler): void;
}

export abstract class MessageBus implements IMessageBus {
  protected messageHandlers: MessageHandler[] = [];

  public abstract sendMessage(message: string): void;

  public onMessage = (handler: MessageHandler) => {
    this.messageHandlers.push(handler);
  }

  protected notify = (message: string) => {
    for (const handler of this.messageHandlers) {
      handler(message);
    }
  }
}

export class FrameMessageBus extends MessageBus {
  constructor(private targetWindow: Window = window) {
    super();
    targetWindow.addEventListener('message', (event) => {
      if (event.data.startsWith(FRAME_MESSAGE_PREFIX)) {
        this.notify((event.data as string).substr(FRAME_MESSAGE_PREFIX.length));
      }
    });
  }

  sendMessage(message: string) {
    this.targetWindow.postMessage(`${FRAME_MESSAGE_PREFIX}${message}`, 'file://');
  }
}

export interface MinimalIPCRenderer {
  on(channel: string, handler: Function): void;
  send(channel: string, ...args: any[]): void;
}

export class IPCRendererMessageBus extends MessageBus {
  constructor(private ipcRenderer: MinimalIPCRenderer = electron.ipcRenderer) {
    super();
    this.ipcRenderer.on(IPC_MESSAGE_CHANNEL, (_: Event, message: string) => this.notify(message));
  }

  sendMessage(message: string) {
    this.ipcRenderer.send(IPC_MESSAGE_CHANNEL, message);
  }
}

export interface MinimalIPCMain {
  on(channel: string, handler: Function): void;
}

export class IPCMainMessageBus extends MessageBus {
  constructor(private target: electron.BrowserWindow, private ipcMain: MinimalIPCMain = electron.ipcMain) {
    super();
    this.ipcMain.on(IPC_MESSAGE_CHANNEL, (_: Event, message: string) => this.notify(message));
  }

  sendMessage(message: string) {
    this.target.webContents.send(IPC_MESSAGE_CHANNEL, message);
  }
}

/**
 * LocalTestMessageBus
 *
 * Please do not use this in production, this message bus is purely used for
 * local testing and development purposes.  It allows you to do same context /
 * same process testing of things that use message bus
 */
export class LocalTestMessageBus extends MessageBus {
  constructor(public emitter: EventEmitter2) {
    super();
    this.emitter.on('message', (message: string) => this.notify(message));
  }

  sendMessage(message: string) {
    this.emitter.emit('message', message);
  }
}
