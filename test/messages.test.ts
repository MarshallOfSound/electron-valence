import test from 'ava';

import * as messages from '../src/messages';

test('createMessage should modify the input', t => {
	t.not(messages.createMessage('foo'), 'foo');
});

test('createMessage should consistently output the same result', t => {
	t.is(messages.createMessage('foo'), messages.createMessage('foo'));
});

test('all targets should be unique', t => {
	const values = Object.keys(messages.TARGETS)
		.map(key => (messages.TARGETS as any)[key]);
	t.is(values.length, (new Set(values)).size, 'unique items should be the same number as total items');
});
