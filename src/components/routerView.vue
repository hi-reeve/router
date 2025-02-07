<template>
  <template v-if="component">
    <slot name="default" v-bind="{ route, component, rejection }">
      <component :is="component" />
    </slot>
  </template>
</template>

<script lang="ts" setup>
  import { Component, UnwrapRef, VNode, computed, provide, resolveComponent } from 'vue'
  import { useRejection } from '@/compositions/useRejection'
  import { useRoute } from '@/compositions/useRoute'
  import { useRouterDepth } from '@/compositions/useRouterDepth'
  import { component as componentUtil } from '@/services/component'
  import { RouterRejection } from '@/services/createRouterReject'
  import { RouterRoute } from '@/services/createRouterRoute'
  import { CreateRouteOptions, isWithComponent, isWithComponents } from '@/types/createRouteOptions'
  import { depthInjectionKey } from '@/types/injectionDepth'

  const { name = 'default' } = defineProps<{
    name?: string,
  }>()

  const route = useRoute()
  const rejection = useRejection()
  const depth = useRouterDepth()
  const routerView = resolveComponent('RouterView', true)

  defineSlots<{
    default?: (props: {
      route: RouterRoute,
      component: Component,
      rejection: UnwrapRef<RouterRejection>,
    }) => VNode,
  }>()

  provide(depthInjectionKey, depth + 1)

  const component = computed(() => {
    if (rejection.value) {
      return rejection.value.component
    }

    const match = route.matches.at(depth)

    if (!match) {
      return null
    }

    const component = getComponent(match)
    const props = getProps(match)

    if (!component) {
      return null
    }

    if (props) {
      // So that the props are reactive we need to actually access the route params in this computed
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
      route.params

      return componentUtil(component, () => props(route.params))
    }

    return component
  })

  function getComponent(match: CreateRouteOptions): Component | undefined {
    const allComponents = getAllComponents(match)

    return allComponents[name]
  }

  function getAllComponents(options: CreateRouteOptions): Record<string, Component | undefined> {
    if (isWithComponents(options)) {
      return options.components
    }

    if (isWithComponent(options)) {
      return { default: options.component }
    }

    if (typeof routerView === 'string') {
      return {}
    }

    return { default: routerView }
  }

  type ComponentProps = (params: Record<string, unknown>) => Record<string, unknown>

  function getProps(options: CreateRouteOptions): ComponentProps | undefined {
    const allProps = getAllProps(options)

    return allProps[name]
  }

  function getAllProps(options: CreateRouteOptions): Record<string, ComponentProps | undefined> {
    if (isWithComponents(options)) {
      return options.props ?? {}
    }

    if (isWithComponent(options)) {
      return { default: options.props }
    }

    return {}
  }
</script>