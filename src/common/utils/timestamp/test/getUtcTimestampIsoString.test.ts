import { getUtcTimestampIsoString } from '../getUtcTimestampIsoString'

describe('[UTILS] Timestamp', () => {
  describe('getUtcTimestampIsoString', () => {
    it('must provide a valid UTC ISO timestamp string', () => {
      const timestamp = getUtcTimestampIsoString()

      expect(timestamp).toMatch(/^\d{4}(-\d{2}){2}T\d{2}(:\d{2}){2}\.\d{3}Z$/)
    })
  })
})
