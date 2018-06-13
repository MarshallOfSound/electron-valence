export const createMessage = (name: string) => `ElectronValence::${name}`;

export interface RequestResponse {
  request: string;
  response: string;
}
export const createRequestResponse = (message: string): RequestResponse => ({
  request: `${message}::Request`,
  response: `${message}::Response`,
});

export const TARGETS = {
  BRIDGE: 'TARGET_BRIDGE::',
  CONNECTOR: 'TARGET_CONNECTOR::'
}

export const EXPOSED_INTERFACE = createRequestResponse(createMessage('EXPOSED_INTERFACE'));
export const EXPOSED_ITEMS = createRequestResponse(createMessage('EXPOSED_ITEMS'));

// Proxy Stuff
export const FETCH_ITEM_PROPERTY = createRequestResponse(createMessage('PROXY_FETCH_ITEM_PROPERTY'));
export const CALL_ITEM_METHOD = createRequestResponse(createMessage('PROXY_CALL_ITEM_METHOD'));