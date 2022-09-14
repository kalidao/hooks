import { beforeEach, describe, expect, it } from 'vitest'

import { setupClient } from '../../../test'
import { fetchEnsResolver } from './fetchEnsResolver'

describe('fetchEnsResolver', () => {
  describe('args', () => {
    beforeEach(() => {
      setupClient()
    })

    it('chainId', async () => {
      expect(
        await fetchEnsResolver({ name: 'awkweb.eth', chainId: 1 }),
      ).toMatchInlineSnapshot('null')
    })

    describe('name', () => {
      it('no result', async () => {
        const result = await fetchEnsResolver({ name: 'awkweb123.eth' })
        expect(result).toMatchInlineSnapshot(`null`)
      })

      it('has resolver', async () => {
        const result = await fetchEnsResolver({ name: 'awkweb.eth' })
        expect(result).toMatchInlineSnapshot('null')
      })
    })
  })
})
