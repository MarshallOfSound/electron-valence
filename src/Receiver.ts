import { EventEmitter2 } from 'eventemitter2';

import { EXPOSED_INTERFACE, TARGETS, EXPOSED_ITEMS, CALL_ITEM_METHOD, FETCH_ITEM_PROPERTY } from './messages';
import * as utils from './utils';
import { Message } from './types';
import { TypeInterface, PropertyType, simplifyProperty } from './validation';
import { IMessageBus } from './MessageBus';

export { IMessageBus, MessageBus, IPCRendererMessageBus, FrameMessageBus } from './MessageBus';

export class Receiver extends EventEmitter2 {
  private exposedInterface: TypeInterface;
  public items: any[];

  constructor(private bus: IMessageBus) {
    super();
    bus.onMessage(this.messageHandler);
    // Ensure we don't end up syncronously requesting the interface
    // we can't rely on the bus implementation being async
    setTimeout(() => {
      this.request(EXPOSED_INTERFACE.request, null, (msg) => {
        this.exposedInterface = msg.payload;
        this.request(EXPOSED_ITEMS.request, null, (msg) => {
          this.items = msg.payload.map((id: string) => this.proxify([id]));
          this.emit('ready');
        });
      });
    }, 0);
  }

  private getProperty = (itemPath: string[], propName: string) => {
    return new Promise<any>((resolve) => {
      this.request(FETCH_ITEM_PROPERTY.request, {
        itemPath,
        propName
      }, (msg) => {
        resolve(msg.payload);
      });
    });
  }

  private callMethod = (itemPath: string[], propName: string, args: any[], cb: (err: Error | null, returnValue?: any) => void) => {
    this.request(CALL_ITEM_METHOD.request, {
      itemPath,
      propName,
      args
    }, (msg) => {
      if (msg.payload.error) {
        return cb(msg.payload.error);
      }
      cb(null, msg.payload.result);
    })
  }

  private proxify = (itemPath: string[], oInterface = this.exposedInterface) => {
    const proxy: any = {};
    for (const propertyName in oInterface) {
      const prop = simplifyProperty(oInterface[propertyName]);

      let descriptor: PropertyDescriptor = {
        get: () => this.getProperty(itemPath, propertyName),
        configurable: false,
        enumerable: true,
      };
      if (prop.type === PropertyType.OBJECT) {
        descriptor = {
          value: this.proxify(itemPath.concat([propertyName]), prop.properties),
          configurable: false,
          enumerable: true,
        };
      } else if (prop.type === PropertyType.METHOD) {
        descriptor = {
          value: (...args: any[]) => {
            return new Promise((resolve, reject) => {
              this.callMethod(itemPath, propertyName, args, (err: Error, returnValue: any) => {
                if (err) return reject(err);
                resolve(returnValue);
              });
            });
          },
          configurable: false,
          enumerable: true,
        }
      }
      Object.defineProperty(proxy, propertyName, descriptor);
    }
    return proxy;
  }

  private dispatch = (rawName: string, payload?: any) => utils.dispatchTo(this.bus, TARGETS.BRIDGE, rawName, payload);

  private requests: {
    [key: string]: (msg: Message<any>) => void;
  } = {};

  private request = (name: string, payload: any, onResponse: (msg: Message<any>) => void) => {
    const requestId = this.dispatch(name, payload);
    this.requests[requestId] = onResponse;
  }

  private messageHandler = (messageString: string) => {
    const message = utils.parseMessage(messageString);
    if (!message) return;
    if (!utils.isTargettingConnector(message)) return;

    if (message.requestId) {
      const onResponse = this.requests[message.requestId];
      if (onResponse) {
        onResponse(message);
      }
      delete this.requests[message.requestId];
      return;
    }

    switch (message.name) {
    }
  }
}
