console.info('preload');

const { FrameMessageBus, Transmitter, Types: { PropertyType } } = require('../transmitter.js');

const transmitter = new Transmitter(new FrameMessageBus(), {
  exampleProp: {
    type: PropertyType.VALUE,
  },
  stringProp: {
    type: PropertyType.VALUE,
  },
  deep: {
    type: PropertyType.OBJECT,
    properties: {
      foo: {
        type: PropertyType.VALUE,
      }
    }
  },
  sayHi: {
    type: PropertyType.METHOD,
    argValidators: [],
  }
});

transmitter.expose({
  exampleProp: 1,
  stringProp: 'a',
  deep: {
    foo: 'bar'
  },
  sayHi: (name) => `Hello, ${name}`,
});
