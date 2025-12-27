import { z } from 'zod';
import { RpcErrorSchema } from './wallet';

export const GetrawtransactionSchema = z.object({
  result: z.object({
    txid: z.string(),
    hash: z.string(),
    version: z.number(),
    size: z.number(),
    vsize: z.number(),
    weight: z.number(),
    locktime: z.number(),
    vin: z.array(
      z.object({
        txid: z.string(),
        vout: z.number(),
        scriptSig: z.object({
          asm: z.string(),
          hex: z.string(),
        }),
        txinwitness: z.array(z.string()),
        sequence: z.number(),
      })
    ),
    vout: z.array(
      z.object({
        value: z.number(),
        n: z.number(),
        scriptPubKey: z.object({
          asm: z.string(),
          desc: z.string(),
          hex: z.string(),
          address: z.string(),
          type: z.string(),
        }),
      })
    ),
    hex: z.string(),
    blockhash: z.string(),
    confirmations: z.number(),
    time: z.number(),
    blocktime: z.number(),
  }),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});

export type Getrawtransaction = z.infer<typeof GetrawtransactionSchema>;
