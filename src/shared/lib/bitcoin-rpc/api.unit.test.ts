type JsonRpcRequest = {
  jsonrpc: '2.0';
  id: string;
  method: string;
  params: Record<string, unknown>;
};

type FetchMock = jest.Mock<Promise<Response>, [string, RequestInit?]>;

describe('bitcoin-rpc api', () => {
  async function loadApiModule() {
    jest.resetModules();
    process.env.PUBLIC_NODE_URL = 'http://127.0.0.1:48332';
    process.env.PUBLIC_RPC_USER = 'rpc-user';
    process.env.PUBLIC_RPC_PASS = 'rpc-pass';

    return import('./api');
  }

  function createJsonResponse(payload: unknown): Response {
    return {
      json: async () => payload,
    } as Response;
  }

  function installFetchMock(payload: unknown): FetchMock {
    const fetchMock: FetchMock = jest
      .fn<Promise<Response>, [string, RequestInit?]>()
      .mockResolvedValue(createJsonResponse(payload));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    return fetchMock;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetcher posts to base node url when wallet is undefined', async () => {
    const fetchSpy = installFetchMock({ result: true });
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const api = await loadApiModule();
    await api.fetcher('getblockchaininfo', {});

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:48332',
      expect.objectContaining({ method: 'POST' })
    );
    expect(logSpy).toHaveBeenCalledWith('http://127.0.0.1:48332');

    logSpy.mockRestore();
  });

  it('fetcher appends /wallet/ when wallet is an empty string', async () => {
    const fetchSpy = installFetchMock({ result: true });
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const api = await loadApiModule();
    await api.fetcher('listwallets', {}, '');

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:48332/wallet/',
      expect.objectContaining({ method: 'POST' })
    );
    expect(logSpy).toHaveBeenCalledWith('http://127.0.0.1:48332/wallet/');

    logSpy.mockRestore();
  });

  it('fetcher appends /wallet/{name} when wallet is provided', async () => {
    const fetchSpy = installFetchMock({ result: true });
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const api = await loadApiModule();
    await api.fetcher('getwalletinfo', {}, 'primary-wallet');

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:48332/wallet/primary-wallet',
      expect.objectContaining({ method: 'POST' })
    );
    expect(logSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:48332/wallet/primary-wallet'
    );

    logSpy.mockRestore();
  });

  it('getrawtransaction sends expected JSON-RPC method and params', async () => {
    const fetchSpy = installFetchMock({ result: {} });
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const api = await loadApiModule();
    await api.getrawtransaction('tx-id-1', true);

    const request = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse((request.body as string) || '{}') as JsonRpcRequest;

    expect(body.method).toBe('getrawtransaction');
    expect(body.params).toEqual({
      txid: 'tx-id-1',
      verbose: true,
    });
    expect(body.id).toBe('curl');
    expect(body.jsonrpc).toBe('2.0');
  });

  it('listtransactions includes label/count/skip/include_watchonly and wallet path', async () => {
    const fetchSpy = installFetchMock({ result: [] });
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const api = await loadApiModule();
    await api.listtransactions('wallet-a', '*', 5, 10, true);

    const [url, request] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse((request.body as string) || '{}') as JsonRpcRequest;

    expect(url).toBe('http://127.0.0.1:48332/wallet/wallet-a');
    expect(body.method).toBe('listtransactions');
    expect(body.params).toEqual({
      label: '*',
      count: 5,
      skip: 10,
      include_watchonly: true,
    });
  });

  it('gethelp sends command only when provided', async () => {
    const fetchSpy = installFetchMock({ result: '' });
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const api = await loadApiModule();

    await api.gethelp('getblockchaininfo');
    const withCommandBody = JSON.parse(
      ((fetchSpy.mock.calls[0]?.[1] as RequestInit).body as string) || '{}'
    ) as JsonRpcRequest;

    await api.gethelp();
    const withoutCommandBody = JSON.parse(
      ((fetchSpy.mock.calls[1]?.[1] as RequestInit).body as string) || '{}'
    ) as JsonRpcRequest;

    expect(withCommandBody.params).toEqual({ command: 'getblockchaininfo' });
    expect(withoutCommandBody.params).toEqual({});
  });
});
