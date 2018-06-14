import * as uuid from 'uuid';
import { Schema } from 'joi';

import { EXPOSED_INTERFACE, EXPOSED_ITEMS, FETCH_ITEM_PROPERTY, CALL_ITEM_METHOD } from './messages';
import * as utils from './utils';
import { IMessageBus } from './MessageBus';
import * as Validation from './validation';

const Enjoi = require('@marshallofsound/enjoi-browser');

export { IMessageBus, MessageBus, IPCMainMessageBus, FrameMessageBus } from './MessageBus';
export { Validation };

export class Transmitter<T> {
  private items: {
    [itemId: string]: any;
  } = {};
  constructor(private bus: IMessageBus, private exposedInterface: Validation.TypeInterface = {}) {
    bus.onMessage(this.messageHandler);
  }

  private getItemAtPath = (itemPath: string[]) => {
    let item = this.items[itemPath[0]];
    try {
      for (const propInPath of itemPath.slice(1)) {
        item = item[propInPath];
      }
    } catch {
      return null;
    }
    return item;
  }

  private validateMethodArgs = (itemPath: string[], args: any[]) => {
    let inter: any = this.exposedInterface;
    try {
      for (const propInPath of itemPath.slice(1)) {
        if (!inter || !inter.hasOwnProperty || !inter.hasOwnProperty(propInPath)) return null;
        inter = inter[propInPath];
      }
    } catch {
      return null;
    }
    const prop = Validation.simplifyProperty(inter);
    if (prop.type !== Validation.PropertyType.METHOD) {
      return new Error(`This is not even a method...: ${itemPath.join('//')}`);
    }
    if (!Array.isArray(args)) {
      return new Error(`Provided args list was not actually a list, this should not be possible: ${args}`);
    }
    if (args.length > prop.argValidators.length) {
      return new Error(`Too many arguments were provided, this method expects ${prop.argValidators.length} arguments`);
    }
    if (args.length < prop.argValidators.length) {
      return new Error(`Too few arguments were provided, this method expects ${prop.argValidators.length} arguments`);
    }
    for (let argIndex = 0; argIndex < args.length; argIndex += 1) {
      const joi: Schema = Enjoi(prop.argValidators[argIndex]);
      const validationResult = joi.validate(args[argIndex]);
      if (validationResult.error) {
        return validationResult.error;
      }
    }
    return null;
  }

  private messageHandler = (messageString: string) => {
    const message = utils.parseMessage(messageString);
    if (!message) return;
    if (!utils.isTargettingTransmitter(message)) return;

    switch (utils.getRealName(message)) {
      case EXPOSED_INTERFACE.request:
        return utils.respondTo(this.bus, message, EXPOSED_INTERFACE.response, this.exposedInterface);
      case EXPOSED_ITEMS.request:
        return utils.respondTo(this.bus, message, EXPOSED_ITEMS.response, Object.keys(this.items));

      case FETCH_ITEM_PROPERTY.request: {
        let propValue: any = undefined;
        const item = this.getItemAtPath(message.payload.itemPath);
        if (item && typeof item === 'object') {
          propValue = item[message.payload.propName];
        }
        return utils.respondTo(this.bus, message, FETCH_ITEM_PROPERTY.response, propValue);
      }
      case CALL_ITEM_METHOD.request: {
        let returnValue: any = undefined;
        const item = this.getItemAtPath(message.payload.itemPath);
        if (item && typeof item === 'object') {
          if (typeof item[message.payload.propName] === 'function') {
            const validationError = this.validateMethodArgs(
              message.payload.itemPath.concat([message.payload.propName]),
              message.payload.args
            );
            if (validationError) {
              return utils.respondTo(this.bus, message, CALL_ITEM_METHOD.request, { error: { message: validationError.message } })
            }
            try {
              returnValue = item[message.payload.propName](...message.payload.args);
            } catch (err) {
              return utils.respondTo(this.bus, message, CALL_ITEM_METHOD.response, { error: (err && typeof err === 'object') ? { stack: err.stack, message: err.message } : err });
            }
            if (returnValue.then) {
              returnValue.then((r: any) => {
                return utils.respondTo(this.bus, message, CALL_ITEM_METHOD.response, { result: r });
              }).catch((err: Error) => {
                return utils.respondTo(this.bus, message, CALL_ITEM_METHOD.response, { error: (err && typeof err === 'object') ? { stack: err.stack, message: err.message } : err });
              })
              return;
            }
            return utils.respondTo(this.bus, message, CALL_ITEM_METHOD.response, { result: returnValue });
          } else {
            return utils.respondTo(this.bus, message, CALL_ITEM_METHOD.response, { error: { message: 'Property is not a function' } });
          }
        } else {
          return utils.respondTo(this.bus, message, CALL_ITEM_METHOD.response, { error: { message: 'Bad itemPath' } });
        }
      }
    }
  }

  private validateItem = (item: any, exposedInterface: Validation.TypeInterface = this.exposedInterface) => {
    if (!item) {
      throw new Error('The object was null, this was unexpected for an exposed object');
    }
    for (const propertyName in this.exposedInterface) {
      const prop = Validation.simplifyProperty(this.exposedInterface[propertyName]);
      switch (prop.type) {
        case Validation.PropertyType.METHOD:
          if (typeof item[propertyName] !== 'function') {
            throw new Error(`Expected property '${propertyName}' to be a function, but it was ${item[propertyName]}`);
          }
          break;
        case Validation.PropertyType.VALUE:
          if (typeof item[propertyName] === 'function' || typeof item[propertyName] === 'undefined') {
            throw new Error(`Expected property '${propertyName}' to be a value, but it was ${item[propertyName]}`);
          }
          break;
        case Validation.PropertyType.OBJECT:
          if (!item[propertyName] || typeof item[propertyName] !== 'object') {
            throw new Error(`Expected property '${propertyName}' to be an object, but it was ${item[propertyName]}`);
          }
          break;
        default:
          throw new Error(`Property '${propertyName}' as an unrecognized type: "${(prop as any).type}"`);
      }
    }
  }

  expose(item: T) {
    this.validateItem(item);
    this.items[uuid.v4()] = item;
  }
}
