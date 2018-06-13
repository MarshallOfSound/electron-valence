import test, { ExecutionContext } from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { stub } from 'sinon';

import { Transmitter } from '../src/Transmitter';
import { Receiver } from '../src/Receiver';
import { LocalTestMessageBus } from '../src/MessageBus';

type BridgeContext = ExecutionContext<{
  transmitter: Transmitter;
  receiver: Receiver;
  tBus: LocalTestMessageBus;
  rBus: LocalTestMessageBus;
  emitter: EventEmitter2;
}>;

const createFakeBus = () => ({
  sendMessage: stub(),
  onMessage: stub(),
});

test.beforeEach('set up bridge', (t: BridgeContext) => {
  const emitter = new EventEmitter2();
  const tBus = new LocalTestMessageBus(emitter);
  const rBus = new LocalTestMessageBus(emitter);
  t.context = {
    emitter,
    tBus,
    rBus,
    transmitter: new Transmitter(tBus),
    receiver: new Receiver(rBus),
  };
});

test.afterEach('destroy bridge', (t: BridgeContext) => {
  delete t.context;
});

test('constructing a transmitter should register a message handler', (t: BridgeContext) => {
  const fakeBus = createFakeBus();
  new Transmitter(fakeBus);
  t.is(fakeBus.onMessage.callCount, 1, 'exactly one message handler');
});
