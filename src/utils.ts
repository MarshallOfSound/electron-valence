import * as uuid from 'uuid';

import { TARGETS } from './messages';
import { Message } from './types';

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

export const dispatchTo = (target: string, rawName: string, payload?: any) => {
  const id = uuid.v4();
  const name = `${target}${rawName}`;

  window.postMessage(JSON.stringify({
    id,
    name,
    payload,
  }), 'file://');

  return id;
};

export const respondTo = (message: Message<any>, rawName: string, payload?: any) => {
  const id = uuid.v4();
  let target = TARGETS.BRIDGE;
  if (isTargettingBridge(message)) {
    target = TARGETS.CONNECTOR;
  }

  const name = `${target}${rawName}`;

  window.postMessage(JSON.stringify({
    id,
    name,
    payload,
    requestId: message.id,
  }), 'file://');

  return id;
};
