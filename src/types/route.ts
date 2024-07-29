import { CreateRouteOptions, WithComponent, WithComponents, WithHooks, WithHost, WithParent, WithoutHost, WithoutParent } from '@/types/createRouteOptions'
import { Host } from '@/types/host'
import { Param } from '@/types/paramTypes'
import { Path } from '@/types/path'
import { Query } from '@/types/query'
import { RouteMeta } from '@/types/register'

/**
 * Represents an immutable array of Route instances. Return value of `createRoute`, expected param for `createRouter`.
 */
export type Routes = Readonly<Route[]>

/**
 * Represents the structure of a route within the application. Return value of `createRoute`
 * @template TKey - Represents the unique key identifying the route, typically a string.
 * @template TPath - The type or structure of the route's path.
 * @template TQuery - The type or structure of the query parameters associated with the route.
 */
export type Route<
  TKey extends string = string,
  THost extends Host = Host,
  TPath extends Path = Path,
  TQuery extends Query = Query,
  TMeta extends RouteMeta = RouteMeta,
  TStateParams extends Record<string, Param> = Record<string, Param>
> = {
  /**
   * The specific route properties that were matched in the current route.
  */
  matched: CreateRouteOptions & WithHooks & (WithHost | WithoutHost) & (WithComponent | WithComponents) & (WithParent | WithoutParent) & { meta: TMeta } & { state: TStateParams },
  /**
   * The specific route properties that were matched in the current route, including any ancestors.
   * Order of routes will be from greatest ancestor to narrowest matched.
  */
  matches: (CreateRouteOptions & WithHooks & (WithHost | WithoutHost) & (WithComponent | WithComponents) & (WithParent | WithoutParent))[],
  /**
   * Unique identifier for the route, generated by joining route `name` by period. Key is used for routing and for matching.
  */
  key: TKey,
  /**
   * Represents the host for this route. Used for external routes.
  */
  host: THost,
  /**
   * Represents the structured path of the route, including path params.
  */
  path: TPath,
  /**
   * Represents the structured query of the route, including query params.
  */
  query: TQuery,
  depth: number,
}
