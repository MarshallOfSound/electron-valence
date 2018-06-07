import * as uuid from 'uuid';

import { EXPOSED_INTERFACE, EXPOSED_ITEMS, FETCH_ITEM_PROPERTY, CALL_ITEM_METHOD } from './messages';
import { ExposeConstraints } from './types';
import * as utils from './utils';

export default class ContextBridge {
  private items: {
    [itemId: string]: any;
  } = {};
  constructor(private exposedInterface: ExposeConstraints[] = []) {
    self.addEventListener('message', this.messageHandler);
  }

  // private dispatch = (name: string, payload?: any) =>  utils.dispatchTo(TARGETS.CONNECTOR, name, payload);

  private getItemAtPath = (itemPath: string[]) => {
    let item = this.items[itemPath[0]];
    try {
      for (const propInPath of itemPath.slice(1)) {
        item = item[propInPath];
      }
    } catch (err) {
      return null;
    }
    return item;
  }

  private messageHandler = (event: MessageEvent) => {
    if (!event.data) return;
    const message = utils.parseMessage(event.data);
    if (!message) return;
    if (!utils.isTargettingBridge(message)) return;

    switch (utils.getRealName(message)) {
      case EXPOSED_INTERFACE.request:
        return utils.respondTo(message, EXPOSED_INTERFACE.response, this.exposedInterface);
      case EXPOSED_ITEMS.request:
        return utils.respondTo(message, EXPOSED_ITEMS.response, Object.keys(this.items));

      case FETCH_ITEM_PROPERTY.request: {
        let propValue: any = undefined;
        const item = this.getItemAtPath(message.payload.itemPath);
        if (item && typeof item === 'object') {
          propValue = item[message.payload.propName];
        }
        return utils.respondTo(message, FETCH_ITEM_PROPERTY.response, propValue);
      }
      case CALL_ITEM_METHOD.request: {
        let returnValue: any = undefined;
        const item = this.getItemAtPath(message.payload.itemPath);
        if (item && typeof item === 'object') {
          if (typeof item[message.payload.propName] === 'function') {
            try {
              returnValue = item[message.payload.propName](...message.payload.args);
            } catch (err) {
              return utils.respondTo(message, CALL_ITEM_METHOD.response, { error: (err && typeof err === 'object') ? { stack: err.stack, message: err.message } : err });
            }
            if (returnValue.then) {
              returnValue.then((r: any) => {
                return utils.respondTo(message, CALL_ITEM_METHOD.response, { result: r });
              }).catch((err: Error) => {
                return utils.respondTo(message, CALL_ITEM_METHOD.response, { error: (err && typeof err === 'object') ? { stack: err.stack, message: err.message } : err });
              })
              return;
            }
            return utils.respondTo(message, CALL_ITEM_METHOD.response, { result: returnValue });
          } else {
            return utils.respondTo(message, CALL_ITEM_METHOD.response, { error: { message: 'Property is not a function' } });
          }
        } else {
          return utils.respondTo(message, CALL_ITEM_METHOD.response, { error: { message: 'Bad itemPath' } });
        }
      }
    }
  }

  expose(item: any) {
    this.items[uuid.v4()] = item;
  }
}
