import test from 'ava';
import { stub } from 'sinon';

import { IPC_MESSAGE_CHANNEL, IPCRendererMessageBus, MinimalIPCRenderer } from '../src/MessageBus';

const createFakeIpcRenderer = () => {
  const ipc = {
    on: stub(),
    send: stub(),
  };
  return {
    fakeIpc: ipc,
    getIPC() {
      return ipc as MinimalIPCRenderer;
    }
  };
};

test('IPCRendererMessageBus should listen to the message channel on ipcRenderer', t => {
  const ipc = createFakeIpcRenderer();
  new IPCRendererMessageBus(ipc.getIPC());
  t.is(ipc.fakeIpc.on.callCount, 1, 'should have added one event listener');
  t.is(ipc.fakeIpc.on.firstCall.args[0], IPC_MESSAGE_CHANNEL, 'should have added a channel event listener');
});

test('IPCRendererMessageBus should notify a listener when messages are received on the ipc channel', t => {
  const ipc = createFakeIpcRenderer();
  const bus = new IPCRendererMessageBus(ipc.getIPC());
  const messageStub = stub().returns(Promise.resolve());
  bus.onMessage(messageStub);
  ipc.fakeIpc.on.firstCall.args[1](null, 'message info');
  t.is(messageStub.callCount, 1, 'should have called our message handler once');
  t.is(messageStub.firstCall.args[0], 'message info', 'should have passed in the correct message');
});

test('IPCRendererMessageBus should notify multiple listeners when messages are received on the ipc channel', t => {
  const ipc = createFakeIpcRenderer();
  const bus = new IPCRendererMessageBus(ipc.getIPC());
  const messageStub = stub().returns(Promise.resolve());
  bus.onMessage(messageStub);
  const messageStub2 = stub().returns(Promise.resolve());
  bus.onMessage(messageStub2);
  ipc.fakeIpc.on.firstCall.args[1](null, 'message info');
  t.is(messageStub.callCount, 1, 'should have called our message handler once');
  t.is(messageStub.firstCall.args[0], 'message info', 'should have passed in the correct message');
  t.is(messageStub2.callCount, 1, 'should have called our message handler once');
  t.is(messageStub2.firstCall.args[0], 'message info', 'should have passed in the correct message');
});

test('IPCRendererMessageBus should dispatch messages onto ipcRenderer', t => {
  const ipc = createFakeIpcRenderer();
  const bus = new IPCRendererMessageBus(ipc.getIPC());
  bus.sendMessage('test 123');
  t.is(ipc.fakeIpc.send.callCount, 1, 'should have sent exactly 1 message');
  t.is(ipc.fakeIpc.send.firstCall.args[0], IPC_MESSAGE_CHANNEL, 'should have sent it on the correct channel');
  t.is(ipc.fakeIpc.send.firstCall.args[1], 'test 123', 'should have sent the correct message');
});
