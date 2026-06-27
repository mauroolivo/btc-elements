'use server';

import {
  Getblockchaininfo,
  Getmempoolinfo,
  Getmininginfo,
  Getnetworkinfo,
} from '@shared/types/blockchain';
import { Getblock, Getblockhash } from '@features/explorer/types';
import { Help } from '@features/help/types';
import { Getrawtransaction, Rawmempool } from '@shared/types/transaction';
import {
  Createwallet,
  Getbalance,
  Getwalletinfo,
  Listtransactions,
  Listwalletdir,
  Listwallets,
  Loadwallet,
  Unloadwallet,
  Newaddress,
  Sendtoaddress,
  Listunspent,
  Getrawchangeaddress,
  Createrawtransaction,
  Signrawtransactionwithwallet,
  BroadcastResponse,
  Listaddressgroupings,
  Getaddressinfo,
  Getdescriptorinfo,
  Bumpfee,
} from '@features/wallet/types/wallet';
import { ParamsDictionary } from '@shared/types/params';
import { isRpcMockEnabled } from '@shared/lib/bitcoin-rpc/mockConfig';
import { getMockRpcResponse } from '@shared/lib/bitcoin-rpc/mockResponses';

const url = process.env.PUBLIC_NODE_URL || '';
const API_USER = process.env.PUBLIC_RPC_USER;
const API_PASS = process.env.PUBLIC_RPC_PASS;
const auth = Buffer.from(API_USER + ':' + API_PASS).toString('base64');
const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: 'Basic ' + auth,
};

export const fetcher = async (
  method: string,
  params: ParamsDictionary,
  wallet?: string
) => {
  if (isRpcMockEnabled()) {
    return getMockRpcResponse(method);
  }

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'curl',
      method: method,
      params: params,
    }),
  };
  let w = '';
  if (wallet === undefined || wallet === null) {
    w = '';
  } else if (wallet === '') {
    w = '/wallet/';
  } else {
    w = `/wallet/${wallet}`;
  }

  return fetch(`${url}${w}`, options).then((r) => r.json());
};

async function rpcCall<TResponse>(
  method: string,
  params: ParamsDictionary = {},
  wallet?: string
): Promise<TResponse> {
  return (await fetcher(method, params, wallet)) as TResponse;
}

export async function getblockchaininfo(): Promise<Getblockchaininfo> {
  return rpcCall<Getblockchaininfo>('getblockchaininfo');
}

export async function getrawtransaction(
  txid: string,
  verbose: boolean
): Promise<Getrawtransaction> {
  return rpcCall<Getrawtransaction>('getrawtransaction', {
    txid: txid,
    verbose: verbose,
  });
}

export async function listwalletdir(): Promise<Listwalletdir> {
  return rpcCall<Listwalletdir>('listwalletdir');
}

export async function listwallets(): Promise<Listwallets> {
  return rpcCall<Listwallets>('listwallets');
}

export async function unloadwallet(name: string): Promise<Unloadwallet> {
  return rpcCall<Unloadwallet>('unloadwallet', {
    wallet_name: name,
  });
}

export async function loadwallet(name: string): Promise<Loadwallet> {
  return rpcCall<Loadwallet>('loadwallet', {
    filename: name,
  });
}

export async function createwallet(name: string): Promise<Createwallet> {
  return rpcCall<Createwallet>('createwallet', {
    wallet_name: name,
  });
}

export async function getbalance(wallet: string): Promise<Getbalance> {
  return rpcCall<Getbalance>('getbalance', {}, wallet);
}

export async function getwalletinfo(wallet: string): Promise<Getwalletinfo> {
  return rpcCall<Getwalletinfo>('getwalletinfo', {}, wallet);
}

export async function listtransactions(
  wallet: string,
  label: string,
  count: number,
  skip: number,
  include_watchonly: boolean
): Promise<Listtransactions> {
  return rpcCall<Listtransactions>(
    'listtransactions',
    {
      label: label,
      count: count,
      skip: skip,
      include_watchonly: include_watchonly,
    },
    wallet
  );
}

export async function getnewaddress(
  wallet: string,
  addressType: string
): Promise<Newaddress> {
  return rpcCall<Newaddress>(
    'getnewaddress',
    {
      address_type: addressType,
    },
    wallet
  );
}

export async function sendtoaddress(
  payload: ParamsDictionary,
  wallet: string
): Promise<Sendtoaddress> {
  return rpcCall<Sendtoaddress>('sendtoaddress', payload, wallet);
}

export async function listUnspent(wallet: string): Promise<Listunspent> {
  return rpcCall<Listunspent>('listunspent', {}, wallet);
}

export async function getrawchangeaddress(
  wallet: string
): Promise<Getrawchangeaddress> {
  return rpcCall<Getrawchangeaddress>('getrawchangeaddress', {}, wallet);
}

export async function createrawtransaction(
  payload: ParamsDictionary,
  wallet: string
): Promise<Createrawtransaction> {
  return rpcCall<Createrawtransaction>('createrawtransaction', payload, wallet);
}

export async function signrawtransactionwithwallet(
  payload: ParamsDictionary,
  wallet: string
): Promise<Signrawtransactionwithwallet> {
  return rpcCall<Signrawtransactionwithwallet>(
    'signrawtransactionwithwallet',
    payload,
    wallet
  );
}

export async function sendrawtransaction(
  payload: ParamsDictionary,
  wallet: string
): Promise<BroadcastResponse> {
  return rpcCall<BroadcastResponse>('sendrawtransaction', payload, wallet);
}

export async function getblock(
  blockid: string,
  verbosity: number
): Promise<Getblock> {
  return rpcCall<Getblock>('getblock', {
    blockhash: blockid,
    verbosity: verbosity,
  });
}

export async function getblockhash(height: number): Promise<Getblockhash> {
  return rpcCall<Getblockhash>('getblockhash', {
    height: height,
  });
}

export async function getRawmempool(verbose: boolean): Promise<Rawmempool> {
  return rpcCall<Rawmempool>('getrawmempool', {
    verbose: verbose,
  });
}

export async function getmempoolinfo(): Promise<Getmempoolinfo> {
  return rpcCall<Getmempoolinfo>('getmempoolinfo');
}

export async function getmininginfo(): Promise<Getmininginfo> {
  return rpcCall<Getmininginfo>('getmininginfo');
}

export async function getnetworkinfo(): Promise<Getnetworkinfo> {
  return rpcCall<Getnetworkinfo>('getnetworkinfo');
}

export async function gethelp(command?: string): Promise<Help> {
  if (command && command.length > 0) {
    return rpcCall<Help>('help', { command });
  }
  return rpcCall<Help>('help');
}

export async function listaddressgroupings(
  wallet: string
): Promise<Listaddressgroupings> {
  return rpcCall<Listaddressgroupings>('listaddressgroupings', {}, wallet);
}

export async function getaddressinfo(
  address: string,
  wallet: string
): Promise<Getaddressinfo> {
  return rpcCall<Getaddressinfo>(
    'getaddressinfo',
    { address: address },
    wallet
  );
}

export async function getdescriptorinfo(
  descriptor: string,
  wallet: string
): Promise<Getdescriptorinfo> {
  return rpcCall<Getdescriptorinfo>(
    'getdescriptorinfo',
    { descriptor: descriptor },
    wallet
  );
}

export async function help(): Promise<Help> {
  return rpcCall<Help>('help');
}

export async function bumpfee(
  payload: ParamsDictionary,
  wallet: string
): Promise<Bumpfee> {
  return rpcCall<Bumpfee>('bumpfee', payload, wallet);
}
