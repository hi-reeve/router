export type ParamExtras = {
  invalid: (message?: string) => never,
}

export type ParamGetter<T = any> = (value: string, extras: ParamExtras) => T
export type ParamSetter<T = any> = (value: T, extras: ParamExtras) => string

export type ParamGetSet<T = any> = {
  get: ParamGetter<T>,
  set: ParamSetter<T>,
}

export type Param = ParamGetter | ParamGetSet | RegExp | BooleanConstructor | NumberConstructor | StringConstructor | JSON
