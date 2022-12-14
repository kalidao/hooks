import { useNetwork } from 'wagmi'

/**
 *
 * @param chainId the target chain ID where the user should be connected before submitting a transaction.
 * @returns { isUserOnCorrectChain, userChain } - isUserOnCorrectChain is true if the user is connected to the target chainId.
 *  userChain holds a reference to the chain which the user is connected to, if any.
 */
export function useChainGuard({ chainId }: { chainId: number }) {
  const { chain: userChain } = useNetwork()
  const isUserConnected = !!userChain?.id
  const isUserOnCorrectChain =
    userChain?.id && Number(chainId) === userChain?.id ? true : false
  return { isUserOnCorrectChain, isUserConnected, userChain }
}
