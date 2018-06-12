import test from 'ava';
import { stub } from 'sinon';

import { FRAME_MESSAGE_PREFIX, FrameMessageBus } from '../src/MessageBus';

const createFakeWindow = () => {
  const win = {
    addEventListener: stub(),
    postMessage: stub(),
  };
  return {
    fakeWindow: win,
    getWindow() {
      return win as any as Window;
    }
  };
};

test('FrameMessageBus should listen to message events on the window object', t => {
  const win = createFakeWindow();
  new FrameMessageBus(win.getWindow());
  t.is(win.fakeWindow.addEventListener.callCount, 1, 'should have added one event listener');
  t.is(win.fakeWindow.addEventListener.firstCall.args[0], 'message', 'should have added a message event listener');
});

test('FrameMessageBus should not notify anyone when messages are received on the window object without the magic prefix', t => {
  const win = createFakeWindow();
  const bus = new FrameMessageBus(win.getWindow());
  const messageStub = stub().returns(Promise.resolve());
  bus.onMessage(messageStub);
  win.fakeWindow.addEventListener.firstCall.args[1]({ data: 'this is legit I swear' });
  t.is(messageStub.callCount, 0, 'should not have called our message handler');
});

test('FrameMessageBus should notify a listener when messages are received on the window object', t => {
  const win = createFakeWindow();
  const bus = new FrameMessageBus(win.getWindow());
  const messageStub = stub().returns(Promise.resolve());
  bus.onMessage(messageStub);
  win.fakeWindow.addEventListener.firstCall.args[1]({ data: `${FRAME_MESSAGE_PREFIX}message info` });
  t.is(messageStub.callCount, 1, 'should have called our message handler once');
  t.is(messageStub.firstCall.args[0], 'message info', 'should have passed in the correct message');
});

test('FrameMessageBus should notify multiple listeners when messages are received on the window object', t => {
  const win = createFakeWindow();
  const bus = new FrameMessageBus(win.getWindow());
  const messageStub = stub().returns(Promise.resolve());
  const messageStub2 = stub().returns(Promise.resolve());
  bus.onMessage(messageStub);
  bus.onMessage(messageStub2);
  win.fakeWindow.addEventListener.firstCall.args[1]({ data: `${FRAME_MESSAGE_PREFIX}message info` });
  t.is(messageStub.callCount, 1, 'should have called our message handler once');
  t.is(messageStub.firstCall.args[0], 'message info', 'should have passed in the correct message');
  t.is(messageStub2.callCount, 1, 'should have called our message handler once');
  t.is(messageStub2.firstCall.args[0], 'message info', 'should have passed in the correct message');
});

test('FrameMessageBus should dispatch messages onto the window object', t => {
  const win = createFakeWindow();
  const bus = new FrameMessageBus(win.getWindow());
  bus.sendMessage('test 123');
  t.is(win.fakeWindow.postMessage.callCount, 1, 'should have posted exactly 1 message');
  t.is(win.fakeWindow.postMessage.firstCall.args[0], `${FRAME_MESSAGE_PREFIX}test 123`, 'should have posted the correct message');
  t.is(win.fakeWindow.postMessage.firstCall.args[1], 'file://', 'should have sent the magic file origin');
});
