import { z } from 'zod';
import { RpcErrorSchema } from './wallet';
export const GetblockSchema = z.object({
  result: z.object({
    hash: z.string(),
    confirmations: z.number(),
    height: z.number(),
    version: z.number(),
    versionHex: z.string(),
    merkleroot: z.string(),
    time: z.number(),
    mediantime: z.number(),
    nonce: z.number(),
    bits: z.string(),
    difficulty: z.number(),
    chainwork: z.string(),
    nTx: z.number(),
    previousblockhash: z.string(),
    nextblockhash: z.string(),
    strippedsize: z.number(),
    size: z.number(),
    weight: z.number(),
    tx: z.array(z.string()),
  }),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Getblock = z.infer<typeof GetblockSchema>;

export const GetblockhashSchema = z.object({
  result: z.string(),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Getblockhash = z.infer<typeof GetblockhashSchema>;
