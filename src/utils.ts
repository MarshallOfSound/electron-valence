import * as uuid from 'uuid';
import * as Joi from 'joi';

import { TARGETS } from './messages';
import { Message } from './types';
import { IMessageBus } from './MessageBus';

const messageShape = {
  id: Joi.string().required(),
  name: Joi.string().required(),
  requestId: Joi.string().optional(),
  payload: Joi.any().required(),
};

export const parseMessage = (message: string): Message<any> | null => {
  try {
    const o = JSON.parse(message);
    const { error } = Joi.validate(o, messageShape);
    if (error) return null;
    return o as Message<any>;
  } catch (err) {
    return null;
  }
};

export const isTargettingTransmitter = (message: Message<any>) => {
  return message.name.startsWith(TARGETS.TRANSMITTER)
};

export const isTargettingReceiver = (message: Message<any>) => {
  return message.name.startsWith(TARGETS.RECEIVER)
};

export const getRealName = (message: Message<any>) => {
  if (isTargettingTransmitter(message)) {
    return message.name.substr(TARGETS.TRANSMITTER.length);
  } else if (isTargettingReceiver(message)) {
    return message.name.substr(TARGETS.RECEIVER.length);
  }
  return message.name;
}

export const dispatchTo = (bus: IMessageBus, target: string, rawName: string, payload?: any) => {
  const id = uuid.v4();
  const name = `${target}${rawName}`;

  bus.sendMessage(JSON.stringify({
    id,
    name,
    payload,
  }));

  return id;
};

export const respondTo = (bus: IMessageBus, message: Message<any>, rawName: string, payload?: any) => {
  const id = uuid.v4();
  let target = TARGETS.TRANSMITTER;
  if (isTargettingTransmitter(message)) {
    target = TARGETS.RECEIVER;
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
