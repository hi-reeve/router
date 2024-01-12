import { Resolved, Route, RouteMethods, Routes, isPublicRoute } from '@/types'
import { RouteMethod, RouteMethodPush, RouteMethodReplace } from '@/types/routeMethod'
import { RouterPush } from '@/types/router'
import { assembleUrl } from '@/utilities/urlAssembly'

export function createRouteMethods<T extends Routes>(routes: Resolved<Route>[], routerPush: RouterPush): RouteMethods<T> {
  const methods = routes.reduce<Record<string, any>>((methods, route) => {
    let level = methods

    route.matches.forEach(match => {
      if (!match.name) {
        return
      }

      const isLeaf = match === route.matched

      if (isLeaf && isPublicRoute(route.matched)) {
        const method = createRouteMethod({ route, routerPush })

        level[route.name] = Object.assign(method, level[route.name])
        return
      }

      if (isLeaf) {
        return
      }

      level = level[match.name] ??= {}
    })

    return methods
  }, {})

  return methods as any
}

type CreateRouteMethodArgs = {
  route: Resolved<Route>,
  routerPush: RouterPush,
}

function createRouteMethod({ route, routerPush }: CreateRouteMethodArgs): RouteMethod {
  const node: RouteMethod = (params) => {
    const normalizedParams = normalizeRouteParams(params)
    const url = assembleUrl(route, normalizedParams)

    const push: RouteMethodPush = ({ params, ...options } = {}) => {
      if (params) {
        const normalizedParamOverrides = normalizeRouteParams(params)
        const merged = mergeRouteParams(normalizedParams, normalizedParamOverrides)
        const url = assembleUrl(route, merged)

        return routerPush(url, options)
      }

      return routerPush(url, options)
    }

    const replace: RouteMethodReplace = (options) => {
      return routerPush(url, {
        ...options,
        replace: true,
      })
    }

    return {
      url,
      push,
      replace,
    }
  }

  return node
}

function normalizeRouteParams(params: Record<string, unknown>): Record<string, unknown[]> {
  const normalizedParams: Record<string, unknown[]> = {}

  for (const key in Object.keys(params)) {
    const value = params[key]

    normalizedParams[key] = Array.isArray(value) ? value : [value]
  }

  return normalizedParams
}

function mergeRouteParams(paramsA: Record<string, unknown[]>, paramsB: Record<string, unknown[]>): Record<string, unknown[] | undefined> {
  const merged: Record<string, unknown[] | undefined> = { ...paramsA }

  for (const [key, params] of Object.entries(paramsB)) {
    const existing = merged[key] ?? []

    merged[key] = [...existing, ...params]
  }

  return merged
}
