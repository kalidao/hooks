import {
  RenderHookOptions,
  renderHook as defaultRenderHook,
  waitFor,
} from '@testing-library/react'
import * as React from 'react'

import { Client, WagmiConfig } from 'wagmi'

// import { setupClient } from './utils'

type Props = { client?: Client } & {
  children?:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactNode
}
export function wrapper({
  client = setupClient({ queryClient }),
  ...rest
}: Props = {}) {
  return <WagmiConfig client={client} {...rest} />
}

export function renderHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  {
    wrapper: wrapper_,
    ...options_
  }: RenderHookOptions<TProps & { client?: Client }> | undefined = {},
) {
  const options: RenderHookOptions<TProps & { client?: Client }> = {
    ...(wrapper_
      ? { wrapper: wrapper_ }
      : {
          wrapper: (props) => wrapper({ ...props, ...options_?.initialProps }),
        }),
    ...options_,
  }

  const utils = defaultRenderHook<TResult, TProps>(hook, options)
  return {
    ...utils,
    waitFor: (utils as { waitFor?: typeof waitFor })?.waitFor ?? waitFor,
  }
}

export { act, cleanup } from '@testing-library/react'
