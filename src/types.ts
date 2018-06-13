export interface Message<T> {
  id: string;
  requestId?: string;
  name: string;
  payload: T;
}

export function empty() {}