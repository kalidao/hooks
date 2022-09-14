import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  mlootContractConfig,
  setupClient,
  wagmigotchiContractConfig,
} from '../../../test'
import { chain } from '../../constants'
import * as multicall from './multicall'
import * as readContract from './readContract'
import { ReadContractsConfig, readContracts } from './readContracts'

const contracts: ReadContractsConfig['contracts'] = [
  {
    ...wagmigotchiContractConfig,
    functionName: 'love',
    args: '0x27a69ffba1e939ddcfecc8c7e0f967b872bac65c',
  },
  {
    ...wagmigotchiContractConfig,
    functionName: 'love',
    args: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  },
  { ...wagmigotchiContractConfig, functionName: 'getAlive' },
  {
    ...mlootContractConfig,
    functionName: 'tokenOfOwnerByIndex',
    args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', 0],
  },
]

let warnMessages: string[] = []
const warn = vi
  .spyOn(console, 'warn')
  .mockImplementation((message) => warnMessages.push(message))

describe('readContracts', () => {
  beforeEach(() => {
    setupClient({
      chains: [chain.mainnet, { ...chain.polygon, multicall: undefined }],
    })
    warnMessages = []
  })

  it('default', async () => {
    const spy = vi.spyOn(multicall, 'multicall')
    const results = await readContracts({ contracts })

    expect(spy).toHaveBeenCalledWith({
      allowFailure: true,
      contracts,
      chainId: 1,
      overrides: undefined,
    })
    expect(results).toMatchInlineSnapshot(`
      [
        null,
      ]
    `)
  })

  it('falls back to readContract if multicall is not available', async () => {
    const spy = vi.spyOn(readContract, 'readContract')
    const chainId = chain.polygon.id
    const contracts: ReadContractsConfig['contracts'] = [
      {
        ...wagmigotchiContractConfig,
        chainId: chain.polygon.id,
        functionName: 'love',
        args: '0x27a69ffba1e939ddcfecc8c7e0f967b872bac65c',
      },
      {
        ...wagmigotchiContractConfig,
        chainId: chain.polygon.id,
        functionName: 'love',
        args: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      },
      {
        ...wagmigotchiContractConfig,
        chainId: chain.polygon.id,
        functionName: 'getAlive',
      },
      {
        ...mlootContractConfig,
        chainId: chain.polygon.id,
        functionName: 'tokenOfOwnerByIndex',
        args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', 0],
      },
    ]
    const results = await readContracts({
      contracts,
    })

    for (const contract of contracts) {
      expect(spy).toBeCalledWith({ ...contract, chainId })
    }
    expect(results).toMatchInlineSnapshot(`
      [
        null,
        null,
        null,
        null,
      ]
    `)
  })

  describe('multi-chain', () => {
    it('default', async () => {
      const spy = vi.spyOn(multicall, 'multicall')
      const ethContracts: ReadContractsConfig['contracts'] = [
        {
          ...wagmigotchiContractConfig,
          chainId: chain.mainnet.id,
          functionName: 'love',
          args: '0x27a69ffba1e939ddcfecc8c7e0f967b872bac65c',
        },
        {
          ...wagmigotchiContractConfig,
          chainId: chain.mainnet.id,
          functionName: 'love',
          args: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ]
      const polygonContracts: ReadContractsConfig['contracts'] = [
        {
          ...wagmigotchiContractConfig,
          chainId: chain.polygon.id,
          functionName: 'getAlive',
        },
        {
          ...mlootContractConfig,
          chainId: chain.polygon.id,
          functionName: 'tokenOfOwnerByIndex',
          args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', 0],
        },
      ]
      const results = await readContracts({
        contracts: [...ethContracts, ...polygonContracts],
      })

      expect(spy).toHaveBeenCalledWith({
        allowFailure: true,
        contracts: ethContracts,
        chainId: chain.mainnet.id,
        overrides: undefined,
      })
      expect(spy).toHaveBeenCalledWith({
        allowFailure: true,
        contracts: polygonContracts,
        chainId: chain.polygon.id,
        overrides: undefined,
      })
      expect(results).toMatchInlineSnapshot(`
        [
          null,
          null,
          null,
          null,
        ]
      `)
    })

    it('falls back to readContract if multicall is not available', async () => {
      const spy = vi.spyOn(readContract, 'readContract')
      const ethContracts: ReadContractsConfig['contracts'] = [
        {
          ...wagmigotchiContractConfig,
          chainId: chain.mainnet.id,
          functionName: 'love',
          args: '0x27a69ffba1e939ddcfecc8c7e0f967b872bac65c',
        },
        {
          ...wagmigotchiContractConfig,
          chainId: chain.mainnet.id,
          functionName: 'love',
          args: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ]
      const polygonContracts: ReadContractsConfig['contracts'] = [
        {
          ...wagmigotchiContractConfig,
          chainId: chain.polygon.id,
          functionName: 'getAlive',
        },
        {
          ...mlootContractConfig,
          chainId: chain.polygon.id,
          functionName: 'tokenOfOwnerByIndex',
          args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', 0],
        },
      ]
      const results = await readContracts({
        contracts: [...ethContracts, ...polygonContracts],
      })

      for (const contract of ethContracts) {
        expect(spy).toBeCalledWith({ ...contract, chainId: chain.mainnet.id })
      }
      for (const contract of polygonContracts) {
        expect(spy).toBeCalledWith({ ...contract, chainId: chain.polygon.id })
      }
      expect(results).toMatchInlineSnapshot(`
        [
          null,
          null,
          null,
          null,
        ]
      `)
    })
  })

  describe('allowFailure', () => {
    it('throws if allowFailure=false & a contract method fails', async () => {
      await expect(
        readContracts({
          allowFailure: false,
          contracts: [
            ...contracts,
            {
              ...mlootContractConfig,
              chainId: chain.polygon.id,
              functionName: 'tokenOfOwnerByIndex',
              args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', 69420],
            },
          ],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1\\",\\"data\\":\\"0x26581d60\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x26581d60\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":42,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)"',
      )
    })

    it('warns if allowFailure=true & a contract method fails', async () => {
      expect(
        await readContracts({
          allowFailure: true,
          contracts: [
            ...contracts,
            {
              ...mlootContractConfig,
              chainId: chain.polygon.id,
              functionName: 'tokenOfOwnerByIndex',
              args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', 69420],
            },
            {
              ...mlootContractConfig,
              chainId: chain.polygon.id,
              functionName: 'tokenOfOwnerByIndex',
              args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', 69421],
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        [
          null,
          null,
          null,
          null,
          null,
          null,
        ]
      `)
      expect(warn).toBeCalled()
      expect(warnMessages).toMatchInlineSnapshot(`
        [
          "Chain \\"Polygon\\" does not support multicall.",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"love\\",
          \\"chainId\\": 1,
          \\"args\\": \\"0x27a69ffba1e939ddcfecc8c7e0f967b872bac65c\\"
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1\\",\\"data\\":\\"0x3684b4a600000000000000000000000027a69ffba1e939ddcfecc8c7e0f967b872bac65c\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x3684b4a600000000000000000000000027a69ffba1e939ddcfecc8c7e0f967b872bac65c\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":43,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"love\\",
          \\"chainId\\": 1,
          \\"args\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\"
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1\\",\\"data\\":\\"0x3684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x3684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":44,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"getAlive\\",
          \\"chainId\\": 1
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1\\",\\"data\\":\\"0x26581d60\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x26581d60\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":42,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"tokenOfOwnerByIndex\\",
          \\"chainId\\": 1,
          \\"args\\": [
            \\"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e\\",
            0
          ]
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0x1dfe7Ca09e99d10835Bf73044a23B73Fc20623DF\\",\\"data\\":\\"0x2f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000000000\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x2f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000000000\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":45,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"tokenOfOwnerByIndex\\",
          \\"chainId\\": 137,
          \\"args\\": [
            \\"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e\\",
            69420
          ]
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0x1dfe7Ca09e99d10835Bf73044a23B73Fc20623DF\\",\\"data\\":\\"0x2f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000010f2c\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x2f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000010f2c\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":42,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"tokenOfOwnerByIndex\\",
          \\"chainId\\": 137,
          \\"args\\": [
            \\"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e\\",
            69421
          ]
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0x1dfe7Ca09e99d10835Bf73044a23B73Fc20623DF\\",\\"data\\":\\"0x2f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000010f2d\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x2f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000010f2d\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":42,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
        ]
      `)
    })

    it('throws if allowFailure=false & encoding contract function data fails', async () => {
      await expect(
        readContracts({
          allowFailure: false,
          contracts: [
            ...contracts,
            {
              ...mlootContractConfig,
              chainId: chain.polygon.id,
              functionName: 'ownerOf',
              // address is not the wagmigotchi contract
              addressOrName: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
              args: [10e30],
            },
          ],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"overflow [ See: https://links.ethers.org/v5-errors-NUMERIC_FAULT-overflow ] (fault=\\"overflow\\", operation=\\"BigNumber.from\\", value=1e+31, code=NUMERIC_FAULT, version=bignumber/5.7.0)"',
      )
    })

    it('warns if allowFailure=true & encoding contract function data fails', async () => {
      expect(
        await readContracts({
          allowFailure: true,
          contracts: [
            ...contracts,
            {
              ...mlootContractConfig,
              chainId: chain.polygon.id,
              functionName: 'ownerOf',
              // address is not the wagmigotchi contract
              addressOrName: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
              args: [10e30],
            },
            {
              ...mlootContractConfig,
              chainId: chain.polygon.id,
              functionName: 'ownerOf',
              // address is not the wagmigotchi contract
              addressOrName: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
              args: [10e30],
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        [
          null,
          null,
          null,
          null,
          null,
          null,
        ]
      `)
      expect(warn).toBeCalled()
      expect(warnMessages).toMatchInlineSnapshot(`
        [
          "Chain \\"Polygon\\" does not support multicall.",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"love\\",
          \\"chainId\\": 1,
          \\"args\\": \\"0x27a69ffba1e939ddcfecc8c7e0f967b872bac65c\\"
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1\\",\\"data\\":\\"0x3684b4a600000000000000000000000027a69ffba1e939ddcfecc8c7e0f967b872bac65c\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x3684b4a600000000000000000000000027a69ffba1e939ddcfecc8c7e0f967b872bac65c\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":43,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"love\\",
          \\"chainId\\": 1,
          \\"args\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\"
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1\\",\\"data\\":\\"0x3684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x3684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":44,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"getAlive\\",
          \\"chainId\\": 1
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1\\",\\"data\\":\\"0x26581d60\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x26581d60\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":42,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"tokenOfOwnerByIndex\\",
          \\"chainId\\": 1,
          \\"args\\": [
            \\"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e\\",
            0
          ]
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0x1dfe7Ca09e99d10835Bf73044a23B73Fc20623DF\\",\\"data\\":\\"0x2f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000000000\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x2f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000000000\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":45,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"ownerOf\\",
          \\"chainId\\": 137,
          \\"args\\": [
            1e+31
          ]
        }

        Details: Error: overflow [ See: https://links.ethers.org/v5-errors-NUMERIC_FAULT-overflow ] (fault=\\"overflow\\", operation=\\"BigNumber.from\\", value=1e+31, code=NUMERIC_FAULT, version=bignumber/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"ownerOf\\",
          \\"chainId\\": 137,
          \\"args\\": [
            1e+31
          ]
        }

        Details: Error: overflow [ See: https://links.ethers.org/v5-errors-NUMERIC_FAULT-overflow ] (fault=\\"overflow\\", operation=\\"BigNumber.from\\", value=1e+31, code=NUMERIC_FAULT, version=bignumber/5.7.0)",
        ]
      `)
    })

    it('should throw if allowFailure=false & a contract has no response', async () => {
      await expect(
        readContracts({
          allowFailure: false,
          contracts: [
            ...contracts,
            {
              ...wagmigotchiContractConfig,
              chainId: chain.polygon.id,
              functionName: 'love',
              // address is not the wagmigotchi contract
              addressOrName: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
              args: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            },
          ],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1\\",\\"data\\":\\"0x26581d60\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x26581d60\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":42,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)"',
      )
    })

    it('warns if allowFailure=true & a contract has no response', async () => {
      expect(
        await readContracts({
          allowFailure: true,
          contracts: [
            ...contracts,
            {
              ...wagmigotchiContractConfig,
              chainId: chain.polygon.id,
              functionName: 'love',
              // address is not the wagmigotchi contract
              addressOrName: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
              args: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        [
          null,
          null,
          null,
          null,
          null,
        ]
      `)
      expect(warn).toBeCalled()
      expect(warnMessages).toMatchInlineSnapshot(`
        [
          "Chain \\"Polygon\\" does not support multicall.",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"love\\",
          \\"chainId\\": 1,
          \\"args\\": \\"0x27a69ffba1e939ddcfecc8c7e0f967b872bac65c\\"
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1\\",\\"data\\":\\"0x3684b4a600000000000000000000000027a69ffba1e939ddcfecc8c7e0f967b872bac65c\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x3684b4a600000000000000000000000027a69ffba1e939ddcfecc8c7e0f967b872bac65c\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":43,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"love\\",
          \\"chainId\\": 1,
          \\"args\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\"
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1\\",\\"data\\":\\"0x3684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x3684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":44,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"getAlive\\",
          \\"chainId\\": 1
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1\\",\\"data\\":\\"0x26581d60\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xecb504d39723b0be0e3a9aa33d646642d1051ee1\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x26581d60\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":42,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"tokenOfOwnerByIndex\\",
          \\"chainId\\": 1,
          \\"args\\": [
            \\"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e\\",
            0
          ]
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0x1dfe7Ca09e99d10835Bf73044a23B73Fc20623DF\\",\\"data\\":\\"0x2f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000000000\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x2f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000000000\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":45,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
          "Contract method reverted with an error.

        Config:
        {
          \\"addressOrName\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\",
          \\"contractInterface\\": \\"...\\",
          \\"functionName\\": \\"love\\",
          \\"chainId\\": 137,
          \\"args\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\"
        }

        Details: Error: missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\",\\"data\\":\\"0x3684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x3684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":42,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)",
        ]
      `)
    })
  })
})
