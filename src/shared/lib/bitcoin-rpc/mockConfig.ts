export function isRpcMockEnabled() {
  return process.env.BTC_ELEMENTS_MOCK_RPC === '1';
}