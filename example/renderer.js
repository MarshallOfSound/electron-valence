console.info('renderer');

// const Connector = require('../lib/Connector.js').default;

const connector = new Connector();

connector.on('ready', async () => {
  const item = connector.items[0];
  console.log(item);
  console.log(await item.stringProp);
  console.log(await item.exampleProp);
  console.log(Object.keys(item));
  console.info(await item.sayHi('Sam'));
})