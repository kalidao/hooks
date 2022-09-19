import { useNetwork } from 'wagmi'

/**
 *
 * @param chainId the target chain ID where the user should be connected before submitting a transaction.
 * @returns { isUserOnCorrectChain, userChain }
 */
export function useChainGuard({ chainId }: { chainId: number }) {
  const { chain: userChain } = useNetwork()
  const isUserOnCorrectChain =
    userChain?.id && Number(chainId) === userChain?.id ? true : false
  return { isUserOnCorrectChain, userChain }
}
