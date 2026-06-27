type MockRpcResponse = {
  result: unknown;
  error: {
    code: number;
    message: string;
  } | null;
  id: string;
};

export function getMockRpcResponse(method: string): MockRpcResponse {
  switch (method) {
    case 'getblockchaininfo':
      return {
        result: {
          chain: 'testnet4',
          blocks: 310000,
          headers: 310000,
          bestblockhash:
            '000000000000000000007f1d4a4ea9f4e0dc9df5f3f4b6c3d78a6ed5b5f9a2bb',
          difficulty: 1234567.123,
          time: 1719460800,
          mediantime: 1719460500,
          verificationprogress: 1,
          initialblockdownload: false,
          chainwork:
            '0000000000000000000000000000000000000000000004d2f7c18a1f2a3b4c',
          size_on_disk: 12884901888,
          pruned: false,
          warnings: [],
        },
        error: null,
        id: 'mock',
      };
    case 'getmempoolinfo':
      return {
        result: {
          loaded: true,
          size: 18,
          bytes: 9200,
          usage: 24576,
          total_fee: 0.00052,
          maxmempool: 300000000,
          mempoolminfee: 0.00001,
          minrelaytxfee: 0.00001,
          incrementalrelayfee: 0.00001,
          unbroadcastcount: 0,
          fullrbf: true,
        },
        error: null,
        id: 'mock',
      };
    case 'getmininginfo':
      return {
        result: {
          blocks: 310000,
          difficulty: 1234567.123,
          networkhashps: 4200000000,
          pooledtx: 18,
          chain: 'testnet4',
          warnings: [],
        },
        error: null,
        id: 'mock',
      };
    case 'getnetworkinfo':
      return {
        result: {
          version: 310000,
          subversion: '/Satoshi:31.0.0/',
          protocolversion: 70016,
          localservices: '0000000000000409',
          localservicesnames: ['NETWORK', 'WITNESS'],
          localrelay: true,
          timeoffset: 0,
          networkactive: true,
          connections: 8,
          connections_in: 3,
          connections_out: 5,
          networks: [
            {
              name: 'ipv4',
              limited: false,
              reachable: true,
              proxy: '',
              proxy_randomize_credentials: false,
            },
          ],
          relayfee: 0.00001,
          incrementalfee: 0.00001,
          localaddresses: [],
          warnings: [],
        },
        error: null,
        id: 'mock',
      };
    case 'listwalletdir':
      return {
        result: { wallets: [] },
        error: null,
        id: 'mock',
      };
    case 'listwallets':
      return {
        result: [],
        error: null,
        id: 'mock',
      };
    default:
      return {
        result: null,
        error: {
          code: -32601,
          message: `Mock RPC method not implemented: ${method}`,
        },
        id: 'mock',
      };
  }
}
