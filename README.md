<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://avatars.githubusercontent.com/u/97812683?s=200&v=4">
    <img alt="kali dao logo" src="https://avatars.githubusercontent.com/u/97812683?s=200&v=4" width="auto" height="60">
  </picture>
</p>

<p align="center">
  React Hooks for Ethereum and Kali DAO Apps
<p>

<br>

Kali Hooks is a Rect Hooks library that aims to simplify development of Kali DAO based web3 apps. Kali Hooks extends the [wagmi hooks](https://github.com/wagmi-dev/wagmi) library and follows the wagmi best practices.

## Features

- 🚀 React hooks for working with Kali DAO EVM contracts.
- 👟 Caching, request deduplication, multicall, batching, and persistence
- 🦄 TypeScript ready

## Hooks

### useChainGuard

Checks if the user is connected to a target chain. Useful for preventing users from writing to contracts on the wrong chain.

Example React component snippet:

```TypeScript
import { useChainGuard } from 'kalidao-hooks'

const daoHomeChain = chain.arbitrum
const { isUserOnCorrectChain, isUserConnected, userChain } = useChainGuard({ chainId: daoHomeChain.id })

let wrongChainWarning
if (!isUserOnCorrectChain) {
  wrongChainWarning = (!isUserConnected) ?
    wrongChainWarning = `Your Web3 wallet is disconnected. Please connect to ${daoHomeChain.name}.`
    :
    wrongChainWarning = `Your Web3 wallet is connected to ${userChain.name}. Please switch to ${daoHomeChain.name}.`
}

```

## Installation

Install Kali Hooks and its peer dependencies.

```bash
npm install @kalidao/hooks wagmi ethers
```

## Contributing

If you're interested in contributing, please read the [contributing docs](/.github/CONTRIBUTING.md) **before submitting a pull request**.

<a href="https://gitpod.io/#<your-repository-url>">
  <img
    src="https://img.shields.io/badge/Contribute%20with-Gitpod-908a85?logo=gitpod"
    alt="Contribute with Gitpod"
  />
</a>

## License

[MIT](/LICENSE) License
