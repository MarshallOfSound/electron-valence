# Electron Valence

> In chemistry, a **valence electron** is an outer shell electron that is associated with an atom, and that can participate in the formation of a chemical bond if the outer shell is not closed

This module allows to create a seamless and transparent bridge across process's and contexts in an Electron app.  For instance you can make a bridge between a preload script and your renderer process when `contextIsolation` is enabled.

## Why?

Enabling Context Isolation and Sandbox mode are two things you should **definitely** do when building an Electron app, without them your app is a security issue waiting to happen.  Unfortunately there is a considerable learning curve when adopting this two technologies, all communication has to be done by passing string messages around when most people are used to just injecting methods with `window.magicMethod = ...` and calling that method from their renderer.  This module aims to make the process of sharing information and API's between isolated contexts or processes easy and transparent.

# Basic Usage
```html
// index.html
    <script type='text/javascript' src="node_modules/electron-valence/Receiver.js"></script>
    <script type='text/javascript' src="renderer.js"></script>
```

```js
// preload.js
const { Transmitter, FrameMessageBus, Validation } = require('electron-valence/Transmitter');

const {PropertyType} = Validation;

const transmitter = new Transmitter(
    new FrameMessageBus(),
    {
        exampleProp: PropertyType.VALUE,
        deep: {
            type: PropertyType.OBJECT,
            properties: {
                foo: PropertyType.VALUE
            }
        },
        sayHi: {
            type: PropertyType.METHOD,
            argValidators: [{type: 'string', minLength: 3}]
        }
    }
);

transmitter.expose({
    exampleProp: 'exampleValue',
    deep: {
        foo: 123
    },
    sayHi: (name) => `Hey There, ${name}`
});
```

```js
// renderer.js
const receiver = new ElectronValence.Receiver(new ElectronValence.FrameMessageBus());

receiver.ready.then(async () => {
    const firstItem = receiver.items[0];
    console.log(firstItem);
    console.log(await firstItem.exampleProp);
    console.log(await firstItem.deep.foo);
    console.log(await firstItem.sayHi('Sam'));
});
```

## Hold up, why is this kinda verbose...

Although the main goal of this module is to make bridging easier, it needs to do so in a safe, secure and predictable way.  This means that any variable exposed from the transmitter to the receiver must be explicitly declared and any argument sent back from the receiver to the transmitter must be validated on arrival.

You should make your exposed interface and your argument validation **as strict as possible**.  The stricter it is, the safer your code is.

## Opinionated Restrictions For Your Own Good

1. You can't set property values from the proxy object on the receiver side

Taking the above example you can't do this: `firstItem.exampleProp = 'foo'`, this is because setters in Javascript can't be `await`'ed which will inherently introduce race conditions.  If you need to set a property value, you should expose a **method** which will set the value, this is safer as you can use our built in argument validation and less flakey as you can `await` the method.  I.e. You should do this `await firstItem.setExampleProp('bar')`.

2. You can't pass non-serializable values backwards through the bridge

The bridge is not completely open in both directions, exposing things from the **transmitter** to the **receiver** uses a proxy technique that allows methods to exposed safely.  Going in the opposite direction (sending things from the **receiver** to the **transmitter**) for instance by calling a function and passing arguments in only allows serializable values.  Functions will be nullified when crossing the bridge in that direction.  The diagrams below illustrate this

![Serial Flow](docs/serial-flow.svg)

# Advanced Usage

You can use this module to span multiple isolation gaps, for example you can go all the way from an isolated renderer process to the main process.

```js
// Main.js
import { Transmitter, IPCMainMessageBus, Validation } from 'electron-valence/transmitter';

const { PropertyType } = Validation;

const transmitter = new Trasmitter(
	new IPCMainMessageBus(mainWindow),
	{
		exampleProp:  PropertyType.VALUE,
	},
);

transmitter.expose({
	exampleProp: 'exampleValue',
});
```

```js
// Preload.js
import { Booster, IPCRendererMessageBus, FrameMessageBus } from 'electron-valence/booster';

const booster = new Booster(
	new IPCRendererMessageBus(),
	new FrameMessageBus(),
});

booster.start();
```

```js
// Renderer.js
import { Receiver, FrameMessageBus } from 'electron-valence/receiver';

const receiver = new Receiver(new FrameMessageBus());

receiver.ready.then(async () => {
	const firstItem = receiver.items[0];
	console.log(firstItem);
	console.log(await firstItem.exampleProp);;
});
```

In this example we are exposing items from the main process, and receiving them across both a process and context isolated boundary in the renderer process.  You can use `Booster` as many times as you want throughout a messages lifecycle so you can do complicated set ups like so.

![Complex Flow](docs/complex-flow.svg)
