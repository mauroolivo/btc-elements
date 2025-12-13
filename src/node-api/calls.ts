"use server";

import { Getblockchaininfo } from "./model/blockchain";
import { Getrawtransaction } from "./model/transaction";
import {
  Getbalance,
  Listwalletdir,
  Listwallets,
  Loadwallet,
  Unloadwallet,
} from "./model/wallet";
import { ParamsDictionary } from "./params";

const url = process.env.PUBLIC_NODE_URL || "";
const API_USER = process.env.PUBLIC_RPC_USER;
const API_PASS = process.env.PUBLIC_RPC_PASS;
const auth = Buffer.from(API_USER + ":" + API_PASS).toString("base64");
const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: "Basic " + auth,
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
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "curl",
      method: method,
      params: params,
    }),
  };
  
  const w = wallet === "" ? "/wallet/" : `/wallet/${wallet}`;
  console.log(`${url}${w}`);
  return fetch(`${url}${w}`, options).then((r) => r.json());
};

export async function getblockchaininfo(): Promise<Getblockchaininfo> {
  return (await fetcher("getblockchaininfo", {})) as Promise<Getblockchaininfo>;
}

export async function getrawtransaction(
  txid: string,
  verbose: boolean
): Promise<Getrawtransaction> {
  return await fetcher("getrawtransaction", {
    txid: txid,
    verbose: verbose,
  });
}

export async function listwalletdir(): Promise<Listwalletdir> {
  return (await fetcher("listwalletdir", {})) as Promise<Listwalletdir>;
}

export async function listwallets(): Promise<Listwallets> {
  return (await fetcher("listwallets", {})) as Promise<Listwallets>;
}

export async function unloadwallet(name: string): Promise<Unloadwallet> {
  return (await fetcher("unloadwallet", {
    wallet_name: name,
  })) as Promise<Unloadwallet>;
}

export async function loadwallet(name: string): Promise<Loadwallet> {
  return (await fetcher("loadwallet", {
    filename: name,
  })) as Promise<Loadwallet>;
}

export async function getbalance(wallet: string): Promise<Getbalance> {
  return (await fetcher("getbalance", {}, wallet)) as Promise<Getbalance>;
}
