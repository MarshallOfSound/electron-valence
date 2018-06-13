console.info('preload');

const { FrameMessageBus, Transmitter } = require('../dist/Bridge.js');

const { FrameMessageBus } = electronContextBridge;

const transmitter = new Transmitter(new FrameMessageBus(), [{
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

transmitter.expose({
  exampleProp: 1,
  stringProp: 'a',
  deep: {
    foo: 'bar'
  },
  sayHi: (name) => `Hello, ${name}`,
});
