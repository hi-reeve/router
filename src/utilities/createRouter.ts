import { reactive, readonly, App, InjectionKey } from 'vue'
import { RouterLink, RouterView } from '@/components'
import { Resolved, Route, Routes, Router, RouterOptions, RouterPushOptions, RegisteredRouter, RouterReplaceOptions } from '@/types'
import { createRouteMethods, createRouterNavigation, resolveRoutes, routeMatch, getInitialUrl, resolveRoutesRegex, assembleUrl, flattenParentMatches } from '@/utilities'

export const routerInjectionKey: InjectionKey<RegisteredRouter> = Symbol()

export function createRouter<T extends Routes>(routes: T, options: RouterOptions = {}): Router<T> {
  const resolved = resolveRoutes(routes)
  const resolvedWithRegex = resolveRoutesRegex(resolved)
  const navigation = createRouterNavigation({
    onLocationUpdate,
  })

  const route: Resolved<Route> = reactive(getInitialRoute())

  function install(app: App): void {
    app.component('RouterView', RouterView)
    app.component('RouterLink', RouterLink)
    app.provide(routerInjectionKey, router as any)
  }

  function getInitialRoute(): Resolved<Route> {
    const url = getInitialUrl(options.initialUrl)

    return getRoute(url)
  }

  function getRoute(url: string): Resolved<Route> {
    const route = routeMatch(resolvedWithRegex, url)

    if (!route) {
      // not found
      throw 'not implemented'
    }

    return { ...route }
  }

  async function onLocationUpdate(url: string): Promise<void> {
    const newRoute = getRoute(url)

    Object.assign(route, newRoute)
  }

  function pushUrl(url: string, options: RouterPushOptions = {}): Promise<void> {
    return navigation.update(url, options)
  }

  function pushRoute({ name, params, replace }: { name: string, params?: Record<string, any> } & RouterPushOptions): Promise<void> {
    const match = resolved.find((route) => flattenParentMatches(route) === name)

    if (!match) {
      throw `No route found with name "${String(name)}"`
    }

    const url = assembleUrl(match, params)

    return navigation.update(url, { replace })
  }

  function push(urlOrRoute: string | { name: string, params?: Record<string, any> } & RouterPushOptions, possiblyOptions: RouterPushOptions = {}): Promise<void> {
    if (typeof urlOrRoute === 'string') {
      return pushUrl(urlOrRoute, possiblyOptions)
    }

    return pushRoute(urlOrRoute)
  }

  async function replace(url: string, options: RouterReplaceOptions = {}): Promise<void> {
    await navigation.update(url, { ...options, replace: true })
  }

  const router = {
    routes: createRouteMethods<T>(resolved, pushUrl),
    route: readonly(route),
    push: push as any,
    replace,
    forward: navigation.forward,
    back: navigation.back,
    go: navigation.go,
    install,
  }

  return router
}