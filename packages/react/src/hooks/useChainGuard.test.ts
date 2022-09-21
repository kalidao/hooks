import { renderHook } from '@testing-library/react-hooks'
import { describe, expect, it, vi } from 'vitest'

import * as wagmi from 'wagmi'
import { chain } from 'wagmi'

import { useChainGuard } from '../'

describe('useChainGuard hook', () => {
  it('should set isUserOnCorrectChain to false when user is not connected', () => {
    vi.spyOn(wagmi, 'useNetwork').mockReturnValueOnce({
      chain: undefined,
      chains: [],
    })
    const { result } = renderHook(() =>
      useChainGuard({ chainId: chain.goerli.id }),
    )
    expect(result.current.isUserOnCorrectChain).toBeFalsy()
    expect(result.current.userChain).toEqual(undefined)
    expect(result.current.isUserConnected).toBeFalsy()
  })
  it('should set isUserOnCorrectChain to false when user is connected to the wrong chain', () => {
    vi.spyOn(wagmi, 'useNetwork').mockReturnValueOnce({
      chain: chain.mainnet,
      chains: [],
    })
    const { result } = renderHook(() =>
      useChainGuard({ chainId: chain.goerli.id }),
    )
    expect(result.current.isUserOnCorrectChain).toBeFalsy()
    expect(result.current.userChain).toBe(wagmi.chain.mainnet)
    expect(result.current.isUserConnected).toBeTruthy()
  })
  it('should set isUserOnCorrectChain to true when user is connected to the targeted chain', () => {
    vi.spyOn(wagmi, 'useNetwork').mockReturnValueOnce({
      chain: chain.goerli,
      chains: [],
    })
    const { result } = renderHook(() =>
      useChainGuard({ chainId: chain.goerli.id }),
    )
    expect(result.current.isUserOnCorrectChain).toBeTruthy()
    expect(result.current.userChain).toBe(wagmi.chain.goerli)
    expect(result.current.isUserConnected).toBeTruthy()
  })
})
