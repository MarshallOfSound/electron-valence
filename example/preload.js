console.info('preload');

// window.addEventListener('message', console.info);

const electronContextBridge = require('../dist/Bridge.js');

const Bridge = electronContextBridge.default;

const { FrameMessageBus } = electronContextBridge;

const bridge = new Bridge(new FrameMessageBus(), [{
    propertyName: 'exampleProp',
    type: 'number'
  },
  {
    propertyName: 'stringProp',
    type: 'string'
  },
  {
    propertyName: 'deep',
    type: {
      name: 'object',
      properties: [{
        propertyName: 'foo',
        type: 'string'
      }]
    }
  },
  {
    propertyName: 'sayHi',
    type: {
      name: 'method',
      arguments: [{
        propertyName: 'name',
        type: 'string'
      }]
    }
  }
]);

bridge.expose({
  exampleProp: 1,
  stringProp: 'a',
  deep: {
    foo: 'bar'
  },
  sayHi: (name) => `Hello, ${name}`,
});