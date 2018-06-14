export interface Message<T> {
  id: string;
  requestId?: string;
  name: string;
  payload: T;
}

export function empty() {}

export type Primitive = string | number | boolean;

export type DirectAsyncValue<T> = T;

export type Asyncify<T> = {
  [P in keyof T]: T[P] extends () => any
    ? () => Promise<ReturnType<T[P]>>
    : (
      T[P] extends (arg1: infer A) => any
        ? (arg1: A) => Promise<ReturnType<T[P]>>
        : (
          T[P] extends (arg1: infer A, arg2: infer B) => any
            ? (arg1: A, arg2: B) => Promise<ReturnType<T[P]>>
            : (
              T[P] extends (arg1: infer A, arg2: infer B, arg3: infer C) => any
                ? (arg1: A, arg2: B, arg3: C) => Promise<ReturnType<T[P]>>
                : (
                  T[P] extends (arg1: infer A, arg2: infer B, arg3: infer C, arg4: infer D) => any
                    ? (arg1: A, arg2: B, arg3: C, arg4: D) => Promise<ReturnType<T[P]>>
                    : (
                      T[P] extends (arg1: infer A, arg2: infer B, arg3: infer C, arg4: infer D, arg5: infer E) => any
                        ? (arg1: A, arg2: B, arg3: C, arg4: D, arg5: E) => Promise<ReturnType<T[P]>>
                        : (
                          T[P] extends (arg1: infer A, arg2: infer B, arg3: infer C, arg4: infer D, arg5: infer E, arg6: infer F) => any
                            ? (arg1: A, arg2: B, arg3: C, arg4: D, arg5: E, arg6: F) => Promise<ReturnType<T[P]>>
                            : (
                              T[P] extends (arg1: infer A, arg2: infer B, arg3: infer C, arg4: infer D, arg5: infer E, arg6: infer F, arg7: infer G) => any
                                ? (arg1: A, arg2: B, arg3: C, arg4: D, arg5: E, arg6: F, arg7: G) => Promise<ReturnType<T[P]>>
                                : (
                                  T[P] extends (...args: any[]) => any
                                    ? (please_raise_an_issue_if_you_see_this: any[]) => Promise<ReturnType<T[P]>>
                                    : (
                                      T[P] extends Primitive | Primitive[]
                                        ? Promise<T[P]>
                                        : (
                                          T[P] extends void
                                            ? Promise<void>
                                            : (
                                              T[P] extends DirectAsyncValue<any>
                                              ? Promise<T[P]>
                                              : Asyncify<T[P]>
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    );
}
