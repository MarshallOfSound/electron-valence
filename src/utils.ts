import * as uuid from 'uuid';

import { TARGETS } from './messages';
import { Message } from './types';
import { MessageBus } from './MessageBus';

export const parseMessage = (message: string): Message<any> | null => {
  try {
    return JSON.parse(message) as Message<any>;
  } catch (err) {
    return null;
  }
};

export const isTargettingBridge = (message: Message<any>) => {
  return message.name.startsWith(TARGETS.BRIDGE)
};

export const isTargettingConnector = (message: Message<any>) => {
  return message.name.startsWith(TARGETS.CONNECTOR)
};

export const getRealName = (message: Message<any>) => {
  if (isTargettingBridge(message)) {
    return message.name.substr(TARGETS.BRIDGE.length);
  }
  return message.name.substr(TARGETS.CONNECTOR.length);
}

export const dispatchTo = (bus: MessageBus, target: string, rawName: string, payload?: any) => {
  const id = uuid.v4();
  const name = `${target}${rawName}`;

  bus.sendMessage(JSON.stringify({
    id,
    name,
    payload,
  }));

  return id;
};

export const respondTo = (bus: MessageBus,message: Message<any>, rawName: string, payload?: any) => {
  const id = uuid.v4();
  let target = TARGETS.BRIDGE;
  if (isTargettingBridge(message)) {
    target = TARGETS.CONNECTOR;
  }

  const name = `${target}${rawName}`;

  bus.sendMessage(JSON.stringify({
    id,
    name,
    payload,
    requestId: message.id,
  }));

  return id;
};
