import { Component, markRaw } from 'vue'
import { CombineMeta } from '@/services/combineMeta'
import { CombinePath } from '@/services/combinePath'
import { CombineQuery } from '@/services/combineQuery'
import { CombineState } from '@/services/combineState'
import { host } from '@/services/host'
import { CreateRouteOptions, WithComponent, WithComponents, WithHooks, WithParent, WithState, WithoutComponents, WithoutParent, WithoutState, combineRoutes, isWithParent, isWithState } from '@/types/createRouteOptions'
import { Host } from '@/types/host'
import { toName, ToName } from '@/types/name'
import { ExtractParamTypes } from '@/types/params'
import { Param } from '@/types/paramTypes'
import { Path, ToPath, toPath } from '@/types/path'
import { Query, ToQuery, toQuery } from '@/types/query'
import { RouteMeta } from '@/types/register'
import { Route } from '@/types/route'
import { Identity } from '@/types/utilities'
import { checkDuplicateParams } from '@/utilities/checkDuplicateKeys'

type ParentPath<TParent extends Route | undefined> = TParent extends Route ? TParent['path'] : Path<'', {}>
type ParentQuery<TParent extends Route | undefined> = TParent extends Route ? TParent['query'] : Query<'', {}>

type RouteParams<
  TPath extends string | Path | undefined,
  TQuery extends string | Query | undefined,
  TParent extends Route | undefined = undefined
> = ExtractParamTypes<Identity<CombinePath<ParentPath<TParent>, ToPath<TPath>>['params'] & CombineQuery<ParentQuery<TParent>, ToQuery<TQuery>>['params']>>

export function createRoute<
  const TName extends string | undefined = undefined,
  const TPath extends string | Path | undefined = undefined,
  const TQuery extends string | Query | undefined = undefined,
  const TMeta extends RouteMeta = RouteMeta,
  const TState extends Record<string, Param> = Record<string, Param>
>(options: CreateRouteOptions<TName, TPath, TQuery, TMeta> & WithHooks & WithoutComponents & WithoutParent & (WithState<TState> | WithoutState)): Route<ToName<TName>, Host<'', {}>, ToPath<TPath>, ToQuery<TQuery>, TMeta, TState>

export function createRoute<
  const TParent extends Route,
  const TName extends string | undefined = undefined,
  const TPath extends string | Path | undefined = undefined,
  const TQuery extends string | Query | undefined = undefined,
  const TMeta extends RouteMeta = RouteMeta,
  const TState extends Record<string, Param> = Record<string, Param>
>(options: CreateRouteOptions<TName, TPath, TQuery, TMeta> & WithHooks & WithoutComponents & WithParent<TParent> & (WithState<TState> | WithoutState)): Route<ToName<TName>, Host<'', {}>, CombinePath<TParent['path'], ToPath<TPath>>, CombineQuery<TParent['query'], ToQuery<TQuery>>, CombineMeta<TMeta, TParent['meta']>, CombineState<TState, TParent['state']>>

export function createRoute<
  TComponent extends Component,
  const TName extends string | undefined = undefined,
  const TPath extends string | Path | undefined = undefined,
  const TQuery extends string | Query | undefined = undefined,
  const TMeta extends RouteMeta = RouteMeta,
  const TState extends Record<string, Param> = Record<string, Param>
>(options: CreateRouteOptions<TName, TPath, TQuery, TMeta> & WithHooks & WithComponent<TComponent, RouteParams<TPath, TQuery>> & WithoutParent & (WithState<TState> | WithoutState)): Route<ToName<TName>, Host<'', {}>, ToPath<TPath>, ToQuery<TQuery>, TMeta, TState>

export function createRoute<
  TComponent extends Component,
  const TParent extends Route,
  const TName extends string | undefined = undefined,
  const TPath extends string | Path | undefined = undefined,
  const TQuery extends string | Query | undefined = undefined,
  const TMeta extends RouteMeta = RouteMeta,
  const TState extends Record<string, Param> = Record<string, Param>
>(options: CreateRouteOptions<TName, TPath, TQuery, TMeta> & WithHooks & WithComponent<TComponent, RouteParams<TPath, TQuery, TParent>> & WithParent<TParent> & (WithState<TState> | WithoutState)): Route<ToName<TName>, Host<'', {}>, CombinePath<TParent['path'], ToPath<TPath>>, CombineQuery<TParent['query'], ToQuery<TQuery>>, CombineMeta<TMeta, TParent['meta']>, CombineState<TState, TParent['state']>>

export function createRoute<
  TComponents extends Record<string, Component>,
  const TName extends string | undefined = undefined,
  const TPath extends string | Path | undefined = undefined,
  const TQuery extends string | Query | undefined = undefined,
  const TMeta extends RouteMeta = RouteMeta,
  const TState extends Record<string, Param> = Record<string, Param>
>(options: CreateRouteOptions<TName, TPath, TQuery, TMeta> & WithHooks & WithComponents<TComponents, RouteParams<TPath, TQuery>> & WithoutParent & (WithState<TState> | WithoutState)): Route<ToName<TName>, Host<'', {}>, ToPath<TPath>, ToQuery<TQuery>, TMeta, TState>

export function createRoute<
  TComponents extends Record<string, Component>,
  const TParent extends Route,
  const TName extends string | undefined = undefined,
  const TPath extends string | Path | undefined = undefined,
  const TQuery extends string | Query | undefined = undefined,
  const TMeta extends RouteMeta = RouteMeta,
  const TState extends Record<string, Param> = Record<string, Param>
>(options: CreateRouteOptions<TName, TPath, TQuery, TMeta> & WithHooks & WithComponents<TComponents, RouteParams<TPath, TQuery, TParent>> & WithParent<TParent> & (WithState<TState> | WithoutState)): Route<ToName<TName>, Host<'', {}>, CombinePath<TParent['path'], ToPath<TPath>>, CombineQuery<TParent['query'], ToQuery<TQuery>>, CombineMeta<TMeta, TParent['meta']>, CombineState<TState, TParent['state']>>

export function createRoute(options: CreateRouteOptions): Route {
  const name = toName(options.name)
  const path = toPath(options.path)
  const query = toQuery(options.query)
  const meta = options.meta ?? {}
  const state = isWithState(options) ? options.state : {}
  const rawRoute = markRaw({ meta: {}, state: {}, ...options })

  const route = {
    matched: rawRoute,
    matches: [rawRoute],
    name,
    path,
    query,
    meta,
    state,
    depth: 1,
    host: host('', {}),
    prefetch: options.prefetch,
  }

  const merged = isWithParent(options) ? combineRoutes(options.parent, route) : route

  checkDuplicateParams(merged.path.params, merged.query.params)

  return merged
}