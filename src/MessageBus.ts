import * as electron from 'electron';

export type MessageHandler = (message: string) => void;

export abstract class MessageBus {
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
  constructor() {
    super();
    window.addEventListener('message', (event) => this.notify(event.data as string));
  }

  sendMessage(message: string) {
    window.postMessage(message, 'file://');
  }
}

const IPC_MESSAGE_CHANNEL = 'ELECTRON_CONTEXT_BRIDGE_INTERNAL_MESSAGE_CHANNEL';

export class IPCRendererMessageBus extends MessageBus {
  constructor() {
    super();
    electron.ipcRenderer.on(IPC_MESSAGE_CHANNEL, (_: Event, message: string) => this.notify(message));
  }

  sendMessage(message: string) {
    electron.ipcRenderer.send(IPC_MESSAGE_CHANNEL, message);
  }
}

export class IPCMainMessageBus extends MessageBus {
  constructor(private targets: electron.BrowserWindow[]) {
    super();
    electron.ipcMain.on(IPC_MESSAGE_CHANNEL, (_: Event, message: string) => this.notify(message));
  }

  sendMessage(message: string) {
    for (const target of this.targets) {
      target.webContents.send(IPC_MESSAGE_CHANNEL, message);
    }
  }
}
