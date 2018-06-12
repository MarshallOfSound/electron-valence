import test from 'ava';

import * as utils from '../src/utils';
import { TARGETS } from '../src/messages';

/* parseMessage */
test('parseMessage should JSON parse the input', t => {
	t.deepEqual(utils.parseMessage('{"id":"1", "name":"test", "payload":"foo"}'), {
    id: '1',
    name: 'test',
    payload: 'foo'
  });
});

test('parseMessage should reject messages with an invalid id', t => {
	t.deepEqual(utils.parseMessage('{"id":1, "name":"test", "payload":"foo"}'), null);
});

test('parseMessage should reject messages with an invalid name', t => {
	t.deepEqual(utils.parseMessage('{"id":"1", "name":{}, "payload":"foo"}'), null);
});

test('parseMessage should reject messages with an invalid requestId', t => {
	t.deepEqual(utils.parseMessage('{"id":"1", "name":"yo", "requestId": 99}'), null);
});

test('parseMessage should JSON parse messages with a valid requestId', t => {
	t.deepEqual(utils.parseMessage('{"id":"1", "name":"yo", "requestId": "99"}'), null);
});

/* isTargettingBridge */
test('isTargettingBridge should return true for messages aimed at the bridge', t => {
  t.is(utils.isTargettingBridge({
    name: TARGETS.BRIDGE + 'foo bar'
  } as any), true);
});

test('isTargettingBridge should return false for messages not aimed at the bridge', t => {
  t.is(utils.isTargettingBridge({
    name: 'thingy'
  } as any), false);
});

/* isTargettingConnector */
test('isTargettingConnector should return true for messages aimed at the bridge', t => {
  t.is(utils.isTargettingConnector({
    name: TARGETS.CONNECTOR + 'foo bar'
  } as any), true);
});

test('isTargettingConnector should return false for messages not aimed at the bridge', t => {
  t.is(utils.isTargettingBridge({
    name: 'thingy'
  } as any), false);
});

/* getRealName */
test('getRealName should strip the target from the message name', t => {
  t.is(utils.getRealName({
    name: TARGETS.CONNECTOR + 'foo bar'
  } as any), 'foo bar');

  t.is(utils.getRealName({
    name: TARGETS.BRIDGE + 'thingy'
  } as any), 'thingy');
});

test('getRealName should return the message name when not targetted', t => {
  t.is(utils.getRealName({
    name: 'aim is difficult'
  } as any), 'aim is difficult');
});
