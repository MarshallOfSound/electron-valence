import { IMessageBus, MessageHandler } from './MessageBus';

export { IMessageBus, MessageBus, IPCRendererMessageBus, FrameMessageBus } from './MessageBus';

export class Booster {
  constructor(source1: IMessageBus, source2: IMessageBus) {
    source1.onMessage(this.proxyMessage(source2));
    source2.onMessage(this.proxyMessage(source1));
  }

  private proxyMessage = (target: IMessageBus): MessageHandler => (message) => {
    target.sendMessage(message);
  }
}
