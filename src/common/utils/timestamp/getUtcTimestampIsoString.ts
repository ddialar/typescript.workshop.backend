export const getUtcTimestampIsoString = () => (new Date((new Date()).toUTCString())).toISOString()
