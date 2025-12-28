import { z } from 'zod';
import { RpcErrorSchema } from './wallet';

export const GetblockchaininfoSchema = z.object({
  result: z.object({
    chain: z.string(),
    blocks: z.number(),
    headers: z.number(),
    bestblockhash: z.string(),
    difficulty: z.number(),
    time: z.number(),
    mediantime: z.number(),
    verificationprogress: z.number(),
    initialblockdownload: z.boolean(),
    chainwork: z.string(),
    size_on_disk: z.number(),
    pruned: z.boolean(),
    warnings: z.array(z.string()),
  }),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Getblockchaininfo = z.infer<typeof GetblockchaininfoSchema>;

export const GetmempoolinfoSchema = z.object({
  result: z.object({
    loaded: z.boolean(),
    size: z.number(),
    bytes: z.number(),
    usage: z.number(),
    total_fee: z.number(),
    maxmempool: z.number(),
    mempoolminfee: z.number(),
    minrelaytxfee: z.number(),
    incrementalrelayfee: z.number(),
    unbroadcastcount: z.number(),
    fullrbf: z.boolean(),
  }),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Getmempoolinfo = z.infer<typeof GetmempoolinfoSchema>;

export const GetmininginfoSchema = z.object({
  result: z.object({
    blocks: z.number(),
    difficulty: z.number(),
    networkhashps: z.number(),
    pooledtx: z.number(),
    chain: z.string(),
    warnings: z.array(z.string()),
  }),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Getmininginfo = z.infer<typeof GetmininginfoSchema>;

export const GetnetworkinfoSchema = z.object({
  result: z.object({
    version: z.number(),
    subversion: z.string(),
    protocolversion: z.number(),
    localservices: z.string(),
    localservicesnames: z.array(z.string()),
    localrelay: z.boolean(),
    timeoffset: z.number(),
    networkactive: z.boolean(),
    connections: z.number(),
    connections_in: z.number(),
    connections_out: z.number(),
    networks: z.array(
      z.object({
        name: z.string(),
        limited: z.boolean(),
        reachable: z.boolean(),
        proxy: z.string(),
        proxy_randomize_credentials: z.boolean(),
      })
    ),
    relayfee: z.number(),
    incrementalfee: z.number(),
    localaddresses: z.array(z.any()),
    warnings: z.array(z.string()),
  }),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Getnetworkinfo = z.infer<typeof GetnetworkinfoSchema>;
