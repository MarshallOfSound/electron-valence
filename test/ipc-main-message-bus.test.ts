import test from 'ava';
import { BrowserWindow } from 'electron';
import { stub } from 'sinon';

import { IPC_MESSAGE_CHANNEL, IPCMainMessageBus, MinimalIPCMain } from '../src/MessageBus';

const createFakeIpcRenderer = () => {
  const ipc = {
    on: stub(),
  };
  return {
    fakeIpc: ipc,
    getIPC() {
      return ipc as MinimalIPCMain;
    }
  };
};

const createFakeBrowserWindow = () => {
  const win = {
    webContents: {
      send: stub(),
    },
  };
  return {
    fakeWindow: win,
    getBrowserWindow() {
      return win as any as BrowserWindow;
    },
  };
}

test('IPCMainMessageBus should listen to the message channel on ipcMain', t => {
  const ipc = createFakeIpcRenderer();
  const win = createFakeBrowserWindow();
  new IPCMainMessageBus(win.getBrowserWindow(), ipc.getIPC());
  t.is(ipc.fakeIpc.on.callCount, 1, 'should have added one event listener');
  t.is(ipc.fakeIpc.on.firstCall.args[0], IPC_MESSAGE_CHANNEL, 'should have added a channel event listener');
});

test('IPCMainMessageBus should notify a listener when messages are received on the ipc channel', t => {
  const ipc = createFakeIpcRenderer();
  const win = createFakeBrowserWindow();
  const bus = new IPCMainMessageBus(win.getBrowserWindow(), ipc.getIPC());
  const messageStub = stub().returns(Promise.resolve());
  bus.onMessage(messageStub);
  ipc.fakeIpc.on.firstCall.args[1](null, 'message info');
  t.is(messageStub.callCount, 1, 'should have called our message handler once');
  t.is(messageStub.firstCall.args[0], 'message info', 'should have passed in the correct message');
});

test('IPCMainMessageBus should notify multiple listeners when messages are received on the ipc channel', t => {
  const ipc = createFakeIpcRenderer();
  const win = createFakeBrowserWindow();
  const bus = new IPCMainMessageBus(win.getBrowserWindow(), ipc.getIPC());
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

test('IPCMainMessageBus should dispatch messages onto the target browser window', t => {
  const ipc = createFakeIpcRenderer();
  const win = createFakeBrowserWindow();
  const bus = new IPCMainMessageBus(win.getBrowserWindow(), ipc.getIPC());
  bus.sendMessage('test 123');
  t.is(win.fakeWindow.webContents.send.callCount, 1, 'should have sent exactly 1 message');
  t.is(win.fakeWindow.webContents.send.firstCall.args[0], IPC_MESSAGE_CHANNEL, 'should have sent it on the correct channel');
  t.is(win.fakeWindow.webContents.send.firstCall.args[1], 'test 123', 'should have sent the correct message');
});
