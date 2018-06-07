console.info('preload');

// window.addEventListener('message', console.info);

const Bridge = require('../dist/bridge.js').default;

const bridge = new Bridge([{
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