import { describe, expect, it } from 'vitest'

import { act, mlootContractConfig, renderHook } from '../../../test'
import {
  paginatedIndexesConfig,
  useContractInfiniteReads,
} from './useContractInfiniteReads'

describe('useContractInfiniteReads', () => {
  it('mounts', async () => {
    const { result, waitFor } = renderHook(() =>
      useContractInfiniteReads({
        cacheKey: 'contracts',
        contracts: (index = 0) => [
          { ...mlootContractConfig, functionName: 'getChest', args: [index] },
          { ...mlootContractConfig, functionName: 'getFoot', args: [index] },
          { ...mlootContractConfig, functionName: 'getHand', args: [index] },
        ],
        getNextPageParam: (_, pages) => pages.length + 1,
      }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy(), {
      timeout: 15_000,
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { internal, ...res } = result.current
    expect(res).toMatchInlineSnapshot(`
      {
        "data": {
          "pageParams": [
            undefined,
          ],
          "pages": [
            [
              null,
            ],
          ],
        },
        "error": null,
        "fetchNextPage": [Function],
        "fetchStatus": "idle",
        "hasNextPage": true,
        "isError": false,
        "isFetched": true,
        "isFetching": false,
        "isFetchingNextPage": false,
        "isIdle": false,
        "isLoading": false,
        "isRefetching": false,
        "isSuccess": true,
        "refetch": [Function],
        "status": "success",
      }
    `)
  }, 15_000)

  describe('configuration', () => {
    it('chainId', async () => {
      const { result, waitFor } = renderHook(() =>
        useContractInfiniteReads({
          cacheKey: 'contracts',
          contracts: (index = 0) => [
            {
              ...mlootContractConfig,
              chainId: 1,
              functionName: 'getChest',
              args: [index],
            },
            {
              ...mlootContractConfig,
              chainId: 1,
              functionName: 'getFoot',
              args: [index],
            },
            {
              ...mlootContractConfig,
              chainId: 1,
              functionName: 'getHand',
              args: [index],
            },
          ],
          getNextPageParam: (_, pages) => pages.length + 1,
        }),
      )

      await waitFor(() => expect(result.current.isSuccess).toBeTruthy(), {
        timeout: 15_000,
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { internal, ...res } = result.current
      expect(res).toMatchInlineSnapshot(`
        {
          "data": {
            "pageParams": [
              undefined,
            ],
            "pages": [
              [
                null,
              ],
            ],
          },
          "error": null,
          "fetchNextPage": [Function],
          "fetchStatus": "idle",
          "hasNextPage": true,
          "isError": false,
          "isFetched": true,
          "isFetching": false,
          "isFetchingNextPage": false,
          "isIdle": false,
          "isLoading": false,
          "isRefetching": false,
          "isSuccess": true,
          "refetch": [Function],
          "status": "success",
        }
      `)
    })

    it('enabled', async () => {
      const { result, waitFor } = renderHook(() =>
        useContractInfiniteReads({
          enabled: false,
          cacheKey: 'contracts-enabled',
          contracts: (index = 0) => [
            { ...mlootContractConfig, functionName: 'getChest', args: [index] },
            { ...mlootContractConfig, functionName: 'getFoot', args: [index] },
            { ...mlootContractConfig, functionName: 'getHand', args: [index] },
          ],
          getNextPageParam: (_, pages) => pages.length + 1,
        }),
      )

      await waitFor(() => expect(result.current.isIdle).toBeTruthy())

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { internal, ...res } = result.current
      expect(res).toMatchInlineSnapshot(`
        {
          "data": undefined,
          "error": null,
          "fetchNextPage": [Function],
          "fetchStatus": "idle",
          "hasNextPage": undefined,
          "isError": false,
          "isFetched": false,
          "isFetching": false,
          "isFetchingNextPage": false,
          "isIdle": true,
          "isLoading": false,
          "isRefetching": false,
          "isSuccess": false,
          "refetch": [Function],
          "status": "idle",
        }
      `)
    })

    it('getNextPageParam', async () => {
      const { result, waitFor } = renderHook(() =>
        useContractInfiniteReads({
          cacheKey: 'contracts-getNextPageParam',
          contracts: (index = 0) => [
            { ...mlootContractConfig, functionName: 'getChest', args: [index] },
            { ...mlootContractConfig, functionName: 'getFoot', args: [index] },
            { ...mlootContractConfig, functionName: 'getHand', args: [index] },
          ],
          getNextPageParam: (_, pages) => pages.length + 1,
        }),
      )

      await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

      expect(result.current).toMatchInlineSnapshot(`
        {
          "data": {
            "pageParams": [
              undefined,
            ],
            "pages": [
              [
                null,
              ],
            ],
          },
          "error": null,
          "fetchNextPage": [Function],
          "fetchStatus": "idle",
          "hasNextPage": true,
          "internal": {
            "dataUpdatedAt": 1643673600000,
            "errorUpdatedAt": 0,
            "failureCount": 0,
            "isFetchedAfterMount": true,
            "isLoadingError": false,
            "isPaused": false,
            "isPlaceholderData": false,
            "isPreviousData": false,
            "isRefetchError": false,
            "isStale": true,
            "remove": [Function],
          },
          "isError": false,
          "isFetched": true,
          "isFetching": false,
          "isFetchingNextPage": false,
          "isIdle": false,
          "isLoading": false,
          "isRefetching": false,
          "isSuccess": true,
          "refetch": [Function],
          "status": "success",
        }
      `)

      await act(async () => {
        await result.current.fetchNextPage()
      })

      await waitFor(() =>
        expect(result.current.fetchStatus === 'idle').toBeTruthy(),
      )

      expect(result.current).toMatchInlineSnapshot(`
        {
          "data": {
            "pageParams": [
              undefined,
              2,
            ],
            "pages": [
              [
                null,
              ],
              [
                null,
              ],
            ],
          },
          "error": null,
          "fetchNextPage": [Function],
          "fetchStatus": "idle",
          "hasNextPage": true,
          "internal": {
            "dataUpdatedAt": 1643673600000,
            "errorUpdatedAt": 0,
            "failureCount": 0,
            "isFetchedAfterMount": true,
            "isLoadingError": false,
            "isPaused": false,
            "isPlaceholderData": false,
            "isPreviousData": false,
            "isRefetchError": false,
            "isStale": true,
            "remove": [Function],
          },
          "isError": false,
          "isFetched": true,
          "isFetching": false,
          "isFetchingNextPage": false,
          "isIdle": false,
          "isLoading": false,
          "isRefetching": false,
          "isSuccess": true,
          "refetch": [Function],
          "status": "success",
        }
      `)
    })
  })

  describe('return value', () => {
    it('fetchNextPage', async () => {
      const { result, waitFor } = renderHook(() =>
        useContractInfiniteReads({
          cacheKey: 'contracts-fetchNextPage',
          contracts: (index = 0) => [
            { ...mlootContractConfig, functionName: 'getChest', args: [index] },
            { ...mlootContractConfig, functionName: 'getFoot', args: [index] },
            { ...mlootContractConfig, functionName: 'getHand', args: [index] },
          ],
          getNextPageParam: (_, pages) => pages.length + 1,
        }),
      )

      await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

      expect(result.current).toMatchInlineSnapshot(`
        {
          "data": {
            "pageParams": [
              undefined,
            ],
            "pages": [
              [
                null,
              ],
            ],
          },
          "error": null,
          "fetchNextPage": [Function],
          "fetchStatus": "idle",
          "hasNextPage": true,
          "internal": {
            "dataUpdatedAt": 1643673600000,
            "errorUpdatedAt": 0,
            "failureCount": 0,
            "isFetchedAfterMount": true,
            "isLoadingError": false,
            "isPaused": false,
            "isPlaceholderData": false,
            "isPreviousData": false,
            "isRefetchError": false,
            "isStale": true,
            "remove": [Function],
          },
          "isError": false,
          "isFetched": true,
          "isFetching": false,
          "isFetchingNextPage": false,
          "isIdle": false,
          "isLoading": false,
          "isRefetching": false,
          "isSuccess": true,
          "refetch": [Function],
          "status": "success",
        }
      `)

      await act(async () => {
        await result.current.fetchNextPage({ pageParam: 5 })
      })

      await waitFor(() =>
        expect(result.current.fetchStatus === 'idle').toBeTruthy(),
      )

      expect(result.current).toMatchInlineSnapshot(`
        {
          "data": {
            "pageParams": [
              undefined,
              5,
            ],
            "pages": [
              [
                null,
              ],
              [
                null,
              ],
            ],
          },
          "error": null,
          "fetchNextPage": [Function],
          "fetchStatus": "idle",
          "hasNextPage": true,
          "internal": {
            "dataUpdatedAt": 1643673600000,
            "errorUpdatedAt": 0,
            "failureCount": 0,
            "isFetchedAfterMount": true,
            "isLoadingError": false,
            "isPaused": false,
            "isPlaceholderData": false,
            "isPreviousData": false,
            "isRefetchError": false,
            "isStale": true,
            "remove": [Function],
          },
          "isError": false,
          "isFetched": true,
          "isFetching": false,
          "isFetchingNextPage": false,
          "isIdle": false,
          "isLoading": false,
          "isRefetching": false,
          "isSuccess": true,
          "refetch": [Function],
          "status": "success",
        }
      `)
    })

    it('refetch', async () => {
      const { result } = renderHook(() =>
        useContractInfiniteReads({
          enabled: false,
          cacheKey: 'contracts',
          contracts: (index = 0) => [
            { ...mlootContractConfig, functionName: 'getChest', args: [index] },
            { ...mlootContractConfig, functionName: 'getFoot', args: [index] },
            { ...mlootContractConfig, functionName: 'getHand', args: [index] },
          ],
          getNextPageParam: (_, pages) => pages.length + 1,
        }),
      )

      await act(async () => {
        const { data } = await result.current.refetch()
        expect(data).toMatchInlineSnapshot(`
          {
            "pageParams": [
              undefined,
            ],
            "pages": [
              [
                null,
              ],
            ],
          }
        `)
      })
    })
  })

  describe('paginatedIndexesConfig', () => {
    it('increments from `start = 0` with `perPage = 10`', async () => {
      const { result, waitFor } = renderHook(() =>
        useContractInfiniteReads({
          cacheKey: 'contracts-increment',
          ...paginatedIndexesConfig(
            (index) => ({
              ...mlootContractConfig,
              functionName: 'tokenURI',
              args: [index],
            }),
            { start: 0, perPage: 10, direction: 'increment' },
          ),
        }),
      )

      await waitFor(() => expect(result.current.isSuccess).toBeTruthy(), {
        timeout: 15_000,
      })

      expect(result.current).toMatchInlineSnapshot(`
        {
          "data": {
            "pageParams": [
              undefined,
            ],
            "pages": [
              [
                null,
              ],
            ],
          },
          "error": null,
          "fetchNextPage": [Function],
          "fetchStatus": "idle",
          "hasNextPage": false,
          "internal": {
            "dataUpdatedAt": 1643673600000,
            "errorUpdatedAt": 0,
            "failureCount": 0,
            "isFetchedAfterMount": true,
            "isLoadingError": false,
            "isPaused": false,
            "isPlaceholderData": false,
            "isPreviousData": false,
            "isRefetchError": false,
            "isStale": true,
            "remove": [Function],
          },
          "isError": false,
          "isFetched": true,
          "isFetching": false,
          "isFetchingNextPage": false,
          "isIdle": false,
          "isLoading": false,
          "isRefetching": false,
          "isSuccess": true,
          "refetch": [Function],
          "status": "success",
        }
      `)

      await act(async () => {
        await result.current.fetchNextPage()
      })

      await waitFor(
        () => expect(result.current.fetchStatus === 'idle').toBeTruthy(),
        { timeout: 15_000 },
      )

      expect(result.current.data).toMatchInlineSnapshot(`
        {
          "pageParams": [
            undefined,
          ],
          "pages": [
            [
              null,
            ],
          ],
        }
      `)
    }, 15_000)

    it('decrements from `start = 100` with `perPage = 10`', async () => {
      const { result, waitFor } = renderHook(() =>
        useContractInfiniteReads({
          cacheKey: 'contracts-decrement',
          ...paginatedIndexesConfig(
            (index) => ({
              ...mlootContractConfig,
              functionName: 'tokenURI',
              args: [index],
            }),
            { start: 100, perPage: 10, direction: 'decrement' },
          ),
        }),
      )

      await waitFor(() => expect(result.current.isSuccess).toBeTruthy(), {
        timeout: 15_000,
      })

      expect(result.current).toMatchInlineSnapshot(`
        {
          "data": {
            "pageParams": [
              undefined,
            ],
            "pages": [
              [
                null,
              ],
            ],
          },
          "error": null,
          "fetchNextPage": [Function],
          "fetchStatus": "idle",
          "hasNextPage": false,
          "internal": {
            "dataUpdatedAt": 1643673600000,
            "errorUpdatedAt": 0,
            "failureCount": 0,
            "isFetchedAfterMount": true,
            "isLoadingError": false,
            "isPaused": false,
            "isPlaceholderData": false,
            "isPreviousData": false,
            "isRefetchError": false,
            "isStale": true,
            "remove": [Function],
          },
          "isError": false,
          "isFetched": true,
          "isFetching": false,
          "isFetchingNextPage": false,
          "isIdle": false,
          "isLoading": false,
          "isRefetching": false,
          "isSuccess": true,
          "refetch": [Function],
          "status": "success",
        }
      `)

      await act(async () => {
        await result.current.fetchNextPage()
      })

      await waitFor(
        () => expect(result.current.fetchStatus === 'idle').toBeTruthy(),
        { timeout: 15_000 },
      )

      expect(result.current.data).toMatchInlineSnapshot(`
        {
          "pageParams": [
            undefined,
          ],
          "pages": [
            [
              null,
            ],
          ],
        }
      `)
    })
  })
})
