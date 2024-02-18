import { Param } from '@/types/params'
import { Route } from '@/types/routes'

export type ResolvedRoute = {
  matched: Route,
  matches: Route[],
  name: string,
  path: string,
  query: string,
  params: Record<string, Param[]>,
  depth: number,
}