console.info('preload');

const { FrameMessageBus, Transmitter, Validation: { PropertyType } } = require('../transmitter.js');

const transmitter = new Transmitter(new FrameMessageBus(), {
  exampleProp:  PropertyType.VALUE,
  stringProp: PropertyType.VALUE,
  deep: {
    type: PropertyType.OBJECT,
    properties: {
      foo: PropertyType.VALUE,
    }
  },
  sayHi: {
    type: PropertyType.METHOD,
    argValidators: [{ type: 'string' }],
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
