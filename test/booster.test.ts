import test from 'ava';
import { stub } from 'sinon';

import { Booster } from '../src/Booster';

const createFakeBus = () => ({
  sendMessage: stub(),
  onMessage: stub(),
});

test('constructing a booster should register a message handler on both buses', t => {
  const fakeBus = createFakeBus();
  const fakeBus2 = createFakeBus();
  new Booster(fakeBus, fakeBus2);
  t.is(fakeBus.onMessage.callCount, 1, 'exactly one message handler');
  t.is(fakeBus2.onMessage.callCount, 1, 'exactly one message handler');
});

test('a booster should proxy a message received on the first bus to the second bus', t => {
  const fakeBus = createFakeBus();
  const fakeBus2 = createFakeBus();
  new Booster(fakeBus, fakeBus2);
  fakeBus.onMessage.firstCall.args[0]('foo');
  t.is(fakeBus2.sendMessage.callCount, 1, 'proxied one message');
  t.is(fakeBus2.sendMessage.firstCall.args[0], 'foo', 'proxied the original message');
});

test('a booster should proxy a message received on the second bus to the first bus', t => {
  const fakeBus = createFakeBus();
  const fakeBus2 = createFakeBus();
  new Booster(fakeBus, fakeBus2);
  fakeBus2.onMessage.firstCall.args[0]('bar');
  t.is(fakeBus.sendMessage.callCount, 1, 'proxied one message');
  t.is(fakeBus.sendMessage.firstCall.args[0], 'bar', 'proxied the original message');
});
