import { reactive, toRefs } from 'vue'
import { ResolvedRoute } from '@/types/resolved'
import { RouterPush, RouterPushOptions } from '@/types/routerPush'
import { RouteUpdate } from '@/types/routeUpdate'
import { Writable } from '@/types/utilities'

const isRouterRouteSymbol = Symbol('isRouterRouteSymbol')

export type RouterRoute<TRoute extends ResolvedRoute = ResolvedRoute> = Readonly<{
  /**
   * The specific route properties that were matched in the current route.
   */
  matched: TRoute['matched'],

  /**
   * The specific route properties that were matched in the current route, including any ancestors.
   * Order of routes will be from greatest ancestor to narrowest matched.
   */
  matches: TRoute['matches'],

  /**
   * Unique identifier for the route, generated by joining route `name` by period. Key is used for routing and for matching.
   */
  key: TRoute['key'],

  /**
   * Accessor for query string values from user in the current browser location.
   */
  query: TRoute['query'],

  /**
   * Key value pair for route params, values will be the user provided value from current browser location. Updating these params calls `router.update`
   */
  params: Writable<TRoute['params']>,

  /**
   * A method for updating the current route without re-specifying existing values
   */
  update: RouteUpdate<TRoute>,

  /**
   * A private symbol for type guarding withing this project
   */
  [isRouterRouteSymbol]: true,
}>

export function isRouterRoute(value: unknown): value is RouterRoute {
  return typeof value === 'object' && value !== null && isRouterRouteSymbol in value && value[isRouterRouteSymbol] === true
}

export function createRouterRoute<TRoute extends ResolvedRoute>(route: TRoute, push: RouterPush): RouterRoute<TRoute> {

  function update(keyOrParams: PropertyKey | Partial<ResolvedRoute['params']>, valueOrOptions: any, maybeOptions?: RouterPushOptions): Promise<void> {
    if (typeof keyOrParams === 'object') {
      const params = {
        ...route.params,
        ...keyOrParams,
      }

      return push(route.key, params, valueOrOptions)
    }

    const params = {
      ...route.params,
      [keyOrParams]: valueOrOptions,
    }

    return push(route.key, params, maybeOptions)
  }

  const { matched, matches, key, query, params } = toRefs(route)

  const routerRoute: RouterRoute<TRoute> = reactive({
    matched,
    matches,
    query,
    params,
    key,
    update,
    [isRouterRouteSymbol]: true,
  })

  return new Proxy(routerRoute, {
    get: (target, property, receiver) => {
      if (property === 'params') {
        return new Proxy(route.params, {
          set(_target, property, value) {
            update(property, value)

            return true
          },
        })
      }

      return Reflect.get(target, property, receiver)
    },
  })
}