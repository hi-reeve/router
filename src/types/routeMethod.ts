import { RouterPushOptions, RouterReplaceOptions } from '@/types/router'
import { IsEmptyObject } from '@/types/utilities'

export type RouteMethod<
  TParams extends Record<string, unknown> = Record<string, unknown>
> = IsEmptyObject<TParams> extends false
  ? (params: TParams) => RouteMethodResponse<TParams>
  : () => RouteMethodResponse<TParams>

export type RouteMethodOptions<
  TParams extends Record<string, unknown>
> = {
  params?: Partial<TParams>,
}

export type RouteMethodPush<
  TParams extends Record<string, unknown> = Record<string, unknown>
> = (options?: RouteMethodOptions<TParams> & RouterPushOptions) => Promise<void>

export type RouteMethodReplace<
  TParams extends Record<string, unknown> = Record<string, unknown>
> = (options?: RouteMethodOptions<TParams> & RouterReplaceOptions) => Promise<void>

export type RouteMethodResponse<
  TParams extends Record<string, unknown> = Record<string, unknown>
> = {
  url: string,
  push: RouteMethodPush<TParams>,
  replace: RouteMethodReplace<TParams>,
}
