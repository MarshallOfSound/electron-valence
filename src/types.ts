export interface ExposeConstraints {
  propertyName: string;
  type: 'string' | 'number' | {
    name: 'object';
    properties: ExposeConstraints[]
  } | {
    name: 'method';
    arguments: ExposeConstraints[];
  };
}

export interface Message<T> {
  id: string;
  requestId?: string;
  name: string;
  payload: T;
}

export function empty() {}