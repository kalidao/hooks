import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  mlootContractConfig,
  setupClient,
  wagmigotchiContractConfig,
} from '../../../test'

import { chain } from '../../constants'
import { MulticallConfig, multicall } from './multicall'

const contracts: MulticallConfig['contracts'] = [
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

describe('multicall', () => {
  beforeEach(() => {
    setupClient({
      chains: [chain.mainnet, { ...chain.polygon, multicall: undefined }],
    })
    warnMessages = []
  })

  afterEach(() => {
    warnMessages = []
  })

  it('default', async () => {
    expect(await multicall({ contracts })).toMatchInlineSnapshot(`
      [
        {
          "hex": "0x02",
          "type": "BigNumber",
        },
        {
          "hex": "0x01",
          "type": "BigNumber",
        },
        false,
        {
          "hex": "0x05a6db",
          "type": "BigNumber",
        },
      ]
    `)
  })

  describe('args', () => {
    it('chainId', async () => {
      expect(await multicall({ chainId: 1, contracts })).toMatchInlineSnapshot(`
        [
          {
            "hex": "0x02",
            "type": "BigNumber",
          },
          {
            "hex": "0x01",
            "type": "BigNumber",
          },
          false,
          {
            "hex": "0x05a6db",
            "type": "BigNumber",
          },
        ]
      `)
    })

    it('overrides', async () => {
      expect(await multicall({ contracts, overrides: { blockTag: 'latest' } }))
        .toMatchInlineSnapshot(`
        [
          {
            "hex": "0x02",
            "type": "BigNumber",
          },
          {
            "hex": "0x01",
            "type": "BigNumber",
          },
          false,
          {
            "hex": "0x05a6db",
            "type": "BigNumber",
          },
        ]
      `)
    })

    describe('allowFailure', () => {
      it('throws if allowFailure=false & a contract method fails', async () => {
        await expect(
          multicall({
            allowFailure: false,
            contracts: [
              ...contracts,
              {
                ...mlootContractConfig,
                functionName: 'tokenOfOwnerByIndex',
                args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', 69420],
              },
            ],
          }),
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          '"missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xcA11bde05977b3631167028862bE2a173976CA11\\",\\"data\\":\\"0x82ad56cb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000243684b4a600000000000000000000000027a69ffba1e939ddcfecc8c7e0f967b872bac65c00000000000000000000000000000000000000000000000000000000000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000243684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac00000000000000000000000000000000000000000000000000000000000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000426581d60000000000000000000000000000000000000000000000000000000000000000000000000000000001dfe7ca09e99d10835bf73044a23b73fc20623df0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000442f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001dfe7ca09e99d10835bf73044a23b73fc20623df0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000442f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000010f2c00000000000000000000000000000000000000000000000000000000\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xca11bde05977b3631167028862be2a173976ca11\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x82ad56cb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000243684b4a600000000000000000000000027a69ffba1e939ddcfecc8c7e0f967b872bac65c00000000000000000000000000000000000000000000000000000000000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000243684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac00000000000000000000000000000000000000000000000000000000000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000426581d60000000000000000000000000000000000000000000000000000000000000000000000000000000001dfe7ca09e99d10835bf73044a23b73fc20623df0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000442f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001dfe7ca09e99d10835bf73044a23b73fc20623df0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000442f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e0000000000000000000000000000000000000000000000000000000000010f2c00000000000000000000000000000000000000000000000000000000\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":42,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)"',
        )
      })

      it('warns when allowFailure=true & a contract method fails', async () => {
        expect(
          await multicall({
            allowFailure: true,
            contracts: [
              ...contracts,
              {
                ...mlootContractConfig,
                functionName: 'tokenOfOwnerByIndex',
                args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', 69420],
              },
              {
                ...mlootContractConfig,
                functionName: 'tokenOfOwnerByIndex',
                args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', 69421],
              },
            ],
          }),
        ).toMatchInlineSnapshot(`
          [
            {
              "hex": "0x02",
              "type": "BigNumber",
            },
            {
              "hex": "0x01",
              "type": "BigNumber",
            },
            false,
            {
              "hex": "0x05a6db",
              "type": "BigNumber",
            },
            null,
            null,
          ]
        `)
        expect(warn).toBeCalled()
        expect(warnMessages).toMatchInlineSnapshot(`
          [
            "Contract method reverted with an error.

          Config:
          {
            \\"addressOrName\\": \\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\",
            \\"contractInterface\\": \\"...\\",
            \\"functionName\\": \\"tokenOfOwnerByIndex\\",
            \\"chainId\\": 1,
            \\"args\\": [
              \\"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e\\",
              69420
            ]
          }

          Details: call revert exception; VM Exception while processing transaction: reverted with reason string \\"ERC721Enumerable: owner index out of bounds\\" [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method=\\"tokenOfOwnerByIndex(address,uint256)\\", data=\\"0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002b455243373231456e756d657261626c653a206f776e657220696e646578206f7574206f6620626f756e6473000000000000000000000000000000000000000000\\", errorArgs=[\\"ERC721Enumerable: owner index out of bounds\\"], errorName=\\"Error\\", errorSignature=\\"Error(string)\\", reason=\\"ERC721Enumerable: owner index out of bounds\\", code=CALL_EXCEPTION, version=abi/5.7.0)",
            "Contract method reverted with an error.

          Config:
          {
            \\"addressOrName\\": \\"0x1dfe7ca09e99d10835bf73044a23b73fc20623df\\",
            \\"contractInterface\\": \\"...\\",
            \\"functionName\\": \\"tokenOfOwnerByIndex\\",
            \\"chainId\\": 1,
            \\"args\\": [
              \\"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e\\",
              69421
            ]
          }

          Details: call revert exception; VM Exception while processing transaction: reverted with reason string \\"ERC721Enumerable: owner index out of bounds\\" [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method=\\"tokenOfOwnerByIndex(address,uint256)\\", data=\\"0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002b455243373231456e756d657261626c653a206f776e657220696e646578206f7574206f6620626f756e6473000000000000000000000000000000000000000000\\", errorArgs=[\\"ERC721Enumerable: owner index out of bounds\\"], errorName=\\"Error\\", errorSignature=\\"Error(string)\\", reason=\\"ERC721Enumerable: owner index out of bounds\\", code=CALL_EXCEPTION, version=abi/5.7.0)",
          ]
        `)
      })

      it('throws if allowFailure=false & encoding contract function data fails', async () => {
        await expect(
          multicall({
            allowFailure: false,
            contracts: [
              ...contracts,
              {
                ...mlootContractConfig,
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
        warnMessages = []
        expect(
          await multicall({
            allowFailure: true,
            contracts: [
              ...contracts,
              {
                ...mlootContractConfig,
                functionName: 'ownerOf',
                // address is not the wagmigotchi contract
                addressOrName: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
                args: [10e30],
              },
              {
                ...mlootContractConfig,
                functionName: 'ownerOf',
                // address is not the wagmigotchi contract
                addressOrName: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
                args: [10e30],
              },
            ],
          }),
        ).toMatchInlineSnapshot(`
          [
            {
              "hex": "0x02",
              "type": "BigNumber",
            },
            {
              "hex": "0x01",
              "type": "BigNumber",
            },
            false,
            {
              "hex": "0x05a6db",
              "type": "BigNumber",
            },
            null,
            null,
          ]
        `)
        expect(warn).toBeCalled()
        expect(warnMessages).toMatchInlineSnapshot(`
          [
            "Contract read returned an empty response. This could be due to any of the following:
          - The contract does not have the function \\"ownerOf\\",
          - The parameters passed to the contract function may be invalid, or
          - The address is not a contract.

          Config:
          {
            \\"addressOrName\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\",
            \\"contractInterface\\": \\"...\\",
            \\"functionName\\": \\"ownerOf\\",
            \\"chainId\\": 1,
            \\"args\\": [
              1e+31
            ]
          }",
            "Contract read returned an empty response. This could be due to any of the following:
          - The contract does not have the function \\"ownerOf\\",
          - The parameters passed to the contract function may be invalid, or
          - The address is not a contract.

          Config:
          {
            \\"addressOrName\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\",
            \\"contractInterface\\": \\"...\\",
            \\"functionName\\": \\"ownerOf\\",
            \\"chainId\\": 1,
            \\"args\\": [
              1e+31
            ]
          }",
          ]
        `)
      })

      it('throws if allowFailure=false & a contract has no response', async () => {
        await expect(
          multicall({
            allowFailure: false,
            contracts: [
              ...contracts,
              {
                ...wagmigotchiContractConfig,
                functionName: 'love',
                // address is not the wagmigotchi contract
                addressOrName: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
                args: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
              },
            ],
          }),
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          '"missing revert data in call exception; Transaction reverted without a reason string [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (data=\\"0x\\", transaction={\\"to\\":\\"0xcA11bde05977b3631167028862bE2a173976CA11\\",\\"data\\":\\"0x82ad56cb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000243684b4a600000000000000000000000027a69ffba1e939ddcfecc8c7e0f967b872bac65c00000000000000000000000000000000000000000000000000000000000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000243684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac00000000000000000000000000000000000000000000000000000000000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000426581d60000000000000000000000000000000000000000000000000000000000000000000000000000000001dfe7ca09e99d10835bf73044a23b73fc20623df0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000442f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000243684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac00000000000000000000000000000000000000000000000000000000\\",\\"accessList\\":null}, error={\\"reason\\":\\"missing response\\",\\"code\\":\\"SERVER_ERROR\\",\\"requestBody\\":\\"{\\\\\\"method\\\\\\":\\\\\\"eth_call\\\\\\",\\\\\\"params\\\\\\":[{\\\\\\"to\\\\\\":\\\\\\"0xca11bde05977b3631167028862be2a173976ca11\\\\\\",\\\\\\"data\\\\\\":\\\\\\"0x82ad56cb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000243684b4a600000000000000000000000027a69ffba1e939ddcfecc8c7e0f967b872bac65c00000000000000000000000000000000000000000000000000000000000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000243684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac00000000000000000000000000000000000000000000000000000000000000000000000000000000ecb504d39723b0be0e3a9aa33d646642d1051ee100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000426581d60000000000000000000000000000000000000000000000000000000000000000000000000000000001dfe7ca09e99d10835bf73044a23b73fc20623df0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000442f745c59000000000000000000000000a0cf798816d4b9b9866b5330eea46a18382f251e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000243684b4a6000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac00000000000000000000000000000000000000000000000000000000\\\\\\"},\\\\\\"latest\\\\\\"],\\\\\\"id\\\\\\":42,\\\\\\"jsonrpc\\\\\\":\\\\\\"2.0\\\\\\"}\\",\\"requestMethod\\":\\"POST\\",\\"serverError\\":{\\"errno\\":-111,\\"code\\":\\"ECONNREFUSED\\",\\"syscall\\":\\"connect\\",\\"address\\":\\"127.0.0.1\\",\\"port\\":8545},\\"url\\":\\"http://127.0.0.1:8545\\"}, code=CALL_EXCEPTION, version=providers/5.7.0)"',
        )
      })

      it('warns if allowFailure=true & a contract has no response', async () => {
        expect(
          await multicall({
            allowFailure: true,
            contracts: [
              ...contracts,
              {
                ...wagmigotchiContractConfig,
                functionName: 'love',
                // address is not the wagmigotchi contract
                addressOrName: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
                args: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
              },
              {
                ...wagmigotchiContractConfig,
                functionName: 'love',
                // address is not the wagmigotchi contract
                addressOrName: '0x01D13b073CE170e94f6d530B0Cd54498A87A537F',
                args: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
              },
            ],
          }),
        ).toMatchInlineSnapshot(`
          [
            {
              "hex": "0x02",
              "type": "BigNumber",
            },
            {
              "hex": "0x01",
              "type": "BigNumber",
            },
            false,
            {
              "hex": "0x05a6db",
              "type": "BigNumber",
            },
            null,
            null,
          ]
        `)
        expect(warn).toBeCalled()
        expect(warnMessages).toMatchInlineSnapshot(`
          [
            "Contract read returned an empty response. This could be due to any of the following:
          - The contract does not have the function \\"love\\",
          - The parameters passed to the contract function may be invalid, or
          - The address is not a contract.

          Config:
          {
            \\"addressOrName\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\",
            \\"contractInterface\\": \\"...\\",
            \\"functionName\\": \\"love\\",
            \\"chainId\\": 1,
            \\"args\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\"
          }",
            "Contract read returned an empty response. This could be due to any of the following:
          - The contract does not have the function \\"love\\",
          - The parameters passed to the contract function may be invalid, or
          - The address is not a contract.

          Config:
          {
            \\"addressOrName\\": \\"0x01D13b073CE170e94f6d530B0Cd54498A87A537F\\",
            \\"contractInterface\\": \\"...\\",
            \\"functionName\\": \\"love\\",
            \\"chainId\\": 1,
            \\"args\\": \\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\"
          }",
          ]
        `)
      })
    })
  })

  describe('errors', () => {
    it('should throw if the chain does not support multicall', async () => {
      await expect(
        multicall({ contracts, chainId: chain.polygon.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Chain \\"Polygon\\" does not support multicall."`,
      )
    })

    it('should throw if the chain has not deployed multicall on block', async () => {
      await expect(
        multicall({ contracts, overrides: { blockTag: 1 } }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Chain \\"Ethereum\\" does not support multicall on block 1."`,
      )
    })
  })
})
