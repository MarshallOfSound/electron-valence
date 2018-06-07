import { EventEmitter2 } from 'eventemitter2';

import { EXPOSED_INTERFACE, TARGETS, EXPOSED_ITEMS, CALL_ITEM_METHOD, FETCH_ITEM_PROPERTY } from './messages';
import * as utils from './utils';
import { Message, ExposeConstraints } from './types';

class BridgeConnector extends EventEmitter2 {
  private exposedInterface: ExposeConstraints[];
  public items: any[];

  constructor() {
    super();
    self.addEventListener('message', this.messageHandler);
    this.request(EXPOSED_INTERFACE.request, null, (msg) => {
      this.exposedInterface = msg.payload;
      this.request(EXPOSED_ITEMS.request, null, (msg) => {
        this.items = msg.payload.map((id: string) => this.proxify([id]));
        this.emit('ready');
      });
    });
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
    for (const prop of oInterface) {
      let descriptor: PropertyDescriptor = {
        get: () => this.getProperty(itemPath, prop.propertyName),
        configurable: false,
      };
      if (typeof prop.type === 'object') {
        if (prop.type.name === 'object') {
          descriptor = {
            value: this.proxify(itemPath.concat([prop.propertyName]), prop.type.properties),
            configurable: false,
          };
        } else if (prop.type.name === 'method') {
          descriptor = {
            value: (...args: any[]) => {
              return new Promise((resolve, reject) => {
                this.callMethod(itemPath, prop.propertyName, args, (err: Error, returnValue: any) => {
                  if (err) return reject(err);
                  resolve(returnValue);
                });
              });
            },
            configurable: false,
          }
        }
      }
      Object.defineProperty(proxy, prop.propertyName, descriptor);
    }
    return proxy;
  }

  private dispatch = (rawName: string, payload?: any) => utils.dispatchTo(TARGETS.BRIDGE, rawName, payload);

  private requests: {
    [key: string]: (msg: Message<any>) => void;
  } = {};

  private request = (name: string, payload: any, onResponse: (msg: Message<any>) => void) => {
    const requestId = this.dispatch(name, payload);
    this.requests[requestId] = onResponse;
  }

  private messageHandler = (event: MessageEvent) => {
    if (!event.data) return;
    const message = utils.parseMessage(event.data);
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

module.exports = BridgeConnector;
