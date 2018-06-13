console.info('renderer');

const receiver = new ElectronContextBridge.Receiver(new ElectronContextBridge.FrameMessageBus());

receiver.on('ready', async () => {
  const item = receiver.items[0];
  console.log(item);
  console.log(await item.stringProp);
  console.log(await item.exampleProp);
  console.log(Object.keys(item));
  console.info(await item.sayHi('Sam'));
})