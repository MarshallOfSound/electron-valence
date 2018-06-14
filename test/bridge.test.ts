import test, { ExecutionContext } from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { stub } from 'sinon';

import { Transmitter, Validation } from '../src/Transmitter';
import { Receiver } from '../src/Receiver';
import { LocalTestMessageBus } from '../src/MessageBus';

interface TestStructure {
  prop: string;
  method: () => string;
  asyncMethod: () => Promise<string>;
  methodWithArgs: (a: string, b: number) => string;
}

type BridgeContext = ExecutionContext<{
  transmitter: Transmitter<TestStructure>;
  receiver: () => Receiver<TestStructure>;
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
    transmitter: new Transmitter(tBus, {
      prop: Validation.PropertyType.VALUE,
      method: Validation.PropertyType.METHOD,
      asyncMethod: Validation.PropertyType.METHOD,
      methodWithArgs: {
        type: Validation.PropertyType.METHOD,
        argValidators: [{ type: 'string' }, { type: 'number' }],
      },
    }),
    receiver: () => new Receiver(rBus),
  };
  t.context.transmitter.expose({
    prop: 'value',
    method: () => 'foo',
    asyncMethod: async () => 'bar',
    methodWithArgs: (s, n) => `${s}-${n}`,
  });
});

test.afterEach('destroy bridge', (t: BridgeContext) => {
  delete t.context;
});

test('constructing a transmitter should register a message handler', (t: BridgeContext) => {
  const fakeBus = createFakeBus();
  new Transmitter(fakeBus);
  t.is(fakeBus.onMessage.callCount, 1, 'exactly one message handler');
});

test('constructing a receiver should register a message handler', (t: BridgeContext) => {
  const fakeBus = createFakeBus();
  new Receiver(fakeBus);
  t.is(fakeBus.onMessage.callCount, 1, 'exactly one message handler');
});

test('expose should throw an error when given an invalid structure', (t: BridgeContext) => {
  t.throws(() => t.context.transmitter.expose({
    foo: 'bar'
  } as any));
});

test('expose should allow a valid structure', (t: BridgeContext) => {
  t.notThrows(() => t.context.transmitter.expose({
    prop: 'value',
    method: () => 'foo',
    asyncMethod: async () => 'bar',
    methodWithArgs: (s, n) => `${s}-${n}`,
  }));
});

test('receiver should receive a structure identical to the one exposed', async (t: BridgeContext) => {
  const receiver = t.context.receiver();
  await receiver.ready;
  t.is(receiver.items.length, 1, 'should have exactly 1 item');
  const item = receiver.items[0];
  t.deepEqual(Object.keys(item), ['prop', 'method', 'asyncMethod', 'methodWithArgs'], 'should expose all top level props');
});

test('proxied properties should be correct', async (t: BridgeContext) => {
  const receiver = t.context.receiver();
  await receiver.ready;
  const item = receiver.items[0];
  t.is(await item.prop, 'value');
});

test('proxied methods should return the correct value', async (t: BridgeContext) => {
  const receiver = t.context.receiver();
  await receiver.ready;
  const item = receiver.items[0];
  t.is(await item.method(), 'foo');
});

test('proxied async methods should return the correct value', async (t: BridgeContext) => {
  const receiver = t.context.receiver();
  await receiver.ready;
  const item = receiver.items[0];
  t.is(await item.asyncMethod(), 'bar');
});

test('proxied methods with arguments should return the correct value', async (t: BridgeContext) => {
  const receiver = t.context.receiver();
  await receiver.ready;
  const item = receiver.items[0];
  t.is(await item.methodWithArgs('test', 1), 'test-1');
});

test('proxied methods with arguments should reject if too many args are provided', async (t: BridgeContext) => {
  const receiver = t.context.receiver();
  await receiver.ready;
  const item = receiver.items[0];
  await t.throws(async () => await (item.methodWithArgs as any)('test', 1, 2), /^Too many arguments/);
});

test('proxied methods with arguments should reject if not enough args are provided', async (t: BridgeContext) => {
  const receiver = t.context.receiver();
  await receiver.ready;
  const item = receiver.items[0];
  await t.throws(async () => await (item.methodWithArgs as any)('test'), /^Too few arguments/);
});

test('proxied methods with arguments should reject if invalid args are provided', async (t: BridgeContext) => {
  const receiver = t.context.receiver();
  await receiver.ready;
  const item = receiver.items[0];
  await t.throws(async () => await item.methodWithArgs('test', 'not a number' as any), '"value" must be a number');
});
