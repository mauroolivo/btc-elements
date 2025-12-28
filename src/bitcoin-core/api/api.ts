'use server';

import {
  Getblockchaininfo,
  Getmempoolinfo,
  Getmininginfo,
  Getnetworkinfo,
} from '@/bitcoin-core/model/blockchain';
import {
  Getrawtransaction,
  Rawmempool,
} from '@/bitcoin-core/model/transaction';
import {
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
} from '@/bitcoin-core/model/wallet';
import { ParamsDictionary } from '@/bitcoin-core/params';
import { Getblock, Getblockhash } from '../model/block';

const url = process.env.PUBLIC_NODE_URL || '';
const API_USER = process.env.PUBLIC_RPC_USER;
const API_PASS = process.env.PUBLIC_RPC_PASS;
const auth = Buffer.from(API_USER + ':' + API_PASS).toString('base64');
const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: 'Basic ' + auth,
};

// async function fetchData(method: string, params: ParamsDictionary) {
//   return await fetch(url, {
//     method: "POST",
//     headers: headers,
//     body: JSON.stringify({
//       jsonrpc: "2.0",
//       id: "curl",
//       method: method,
//       params: params,
//     }),
//   });
// }

export const fetcher = async (
  method: string,
  params: ParamsDictionary,
  wallet?: string
) => {
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
  console.log(`${url}${w}`);
  return fetch(`${url}${w}`, options).then((r) => r.json());
};

export async function getblockchaininfo(): Promise<Getblockchaininfo> {
  return (await fetcher('getblockchaininfo', {})) as Promise<Getblockchaininfo>;
}

export async function getrawtransaction(
  txid: string,
  verbose: boolean
): Promise<Getrawtransaction> {
  return await fetcher('getrawtransaction', {
    txid: txid,
    verbose: verbose,
  });
}

export async function listwalletdir(): Promise<Listwalletdir> {
  return (await fetcher('listwalletdir', {})) as Promise<Listwalletdir>;
}

export async function listwallets(): Promise<Listwallets> {
  return (await fetcher('listwallets', {})) as Promise<Listwallets>;
}

export async function unloadwallet(name: string): Promise<Unloadwallet> {
  return (await fetcher('unloadwallet', {
    wallet_name: name,
  })) as Promise<Unloadwallet>;
}

export async function loadwallet(name: string): Promise<Loadwallet> {
  return (await fetcher('loadwallet', {
    filename: name,
  })) as Promise<Loadwallet>;
}

export async function getbalance(wallet: string): Promise<Getbalance> {
  return (await fetcher('getbalance', {}, wallet)) as Promise<Getbalance>;
}

export async function getwalletinfo(wallet: string): Promise<Getwalletinfo> {
  return (await fetcher('getwalletinfo', {}, wallet)) as Promise<Getwalletinfo>;
}

export async function listtransactions(
  wallet: string,
  label: string,
  count: number,
  skip: number,
  include_watchonly: boolean
): Promise<Listtransactions> {
  return (await fetcher(
    'listtransactions',
    {
      label: label,
      count: count,
      skip: skip,
      include_watchonly: include_watchonly,
    },
    wallet
  )) as Promise<Listtransactions>;
}

export async function getnewaddress(
  wallet: string,
  addressType: string
): Promise<Newaddress> {
  return (await fetcher(
    'getnewaddress',
    {
      address_type: addressType,
    },
    wallet
  )) as Promise<Newaddress>;
}

export async function sendtoaddress(
  payload: ParamsDictionary,
  wallet: string
): Promise<Sendtoaddress> {
  return (await fetcher(
    'sendtoaddress',
    payload,
    wallet
  )) as Promise<Sendtoaddress>;
}

export async function listUnspent(wallet: string): Promise<Listunspent> {
  return (await fetcher('listunspent', {}, wallet)) as Promise<Listunspent>;
}

export async function getrawchangeaddress(
  wallet: string
): Promise<Getrawchangeaddress> {
  return (await fetcher(
    'getrawchangeaddress',
    {},
    wallet
  )) as Promise<Getrawchangeaddress>;
}

export async function createrawtransaction(
  payload: ParamsDictionary,
  wallet: string
): Promise<Createrawtransaction> {
  return await fetcher('createrawtransaction', payload, wallet);
}

export async function signrawtransactionwithwallet(
  payload: ParamsDictionary,
  wallet: string
): Promise<Signrawtransactionwithwallet> {
  return (await fetcher(
    'signrawtransactionwithwallet',
    payload,
    wallet
  )) as Promise<Signrawtransactionwithwallet>;
}
export async function sendrawtransaction(
  payload: ParamsDictionary,
  wallet: string
): Promise<BroadcastResponse> {
  return (await fetcher(
    'sendrawtransaction',
    payload,
    wallet
  )) as Promise<BroadcastResponse>;
}

export async function getblock(
  blockid: string,
  verbosity: number
): Promise<Getblock> {
  return (await fetcher('getblock', {
    blockhash: blockid,
    verbosity: verbosity,
  })) as Promise<Getblock>;
}

export async function getblockhash(height: number): Promise<Getblockhash> {
  return (await fetcher('getblockhash', {
    height: height,
  })) as Promise<Getblockhash>;
}

export async function getRawmempool(verbose: boolean): Promise<Rawmempool> {
  return (await fetcher('getrawmempool', {
    verbose: verbose,
  })) as Promise<Rawmempool>;
}

export async function getmempoolinfo(): Promise<Getmempoolinfo> {
  return (await fetcher('getmempoolinfo', {})) as Promise<Getmempoolinfo>;
}

export async function getmininginfo(): Promise<Getmininginfo> {
  return (await fetcher('getmininginfo', {})) as Promise<Getmininginfo>;
}

export async function getnetworkinfo(): Promise<Getnetworkinfo> {
  return (await fetcher('getnetworkinfo', {})) as Promise<Getnetworkinfo>;
}

export async function listaddressgroupings(
  wallet: string
): Promise<Listaddressgroupings> {
  return (await fetcher(
    'listaddressgroupings',
    {},
    wallet
  )) as Promise<Listaddressgroupings>;
}

export async function getaddressinfo(
  address: string,
  wallet: string
): Promise<Getaddressinfo> {
  return (await fetcher(
    'getaddressinfo',
    { address: address },
    wallet
  )) as Promise<Getaddressinfo>;
}

export async function getdescriptorinfo(
  descriptor: string,
  wallet: string
): Promise<Getdescriptorinfo> {
  return await fetcher('getdescriptorinfo', { descriptor: descriptor }, wallet);
}