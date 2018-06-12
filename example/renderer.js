console.info('renderer');

const connector = new Connector.BridgeConnector(new Connector.FrameMessageBus());

connector.on('ready', async () => {
  const item = connector.items[0];
  console.log(item);
  console.log(await item.stringProp);
  console.log(await item.exampleProp);
  console.log(Object.keys(item));
  console.info(await item.sayHi('Sam'));
})