import { z } from 'zod';

export const ListwalletdirSchema = z.object({
  result: z.object({
    wallets: z.array(
      z.object({
        name: z.string(),
      })
    ),
  }),
  error: z.any(),
  id: z.string(),
});
export type Listwalletdir = z.infer<typeof ListwalletdirSchema>;

export const ListwalletsSchema = z.object({
  result: z.array(z.string()),
  error: z.any(),
  id: z.string(),
});
export type Listwallets = z.infer<typeof ListwalletsSchema>;

export const LoadwalletSchema = z.object({
  result: z.object({}),
  error: z.any(),
  id: z.string(),
});
export type Loadwallet = z.infer<typeof LoadwalletSchema>;

export const UnloadwalletSchema = z.object({
  result: z.object({}),
  error: z.any(),
  id: z.string(),
});
export type Unloadwallet = z.infer<typeof UnloadwalletSchema>;

export const GetbalanceSchema = z.object({
  result: z.number(),
  error: z.any(),
  id: z.string(),
});
export type Getbalance = z.infer<typeof GetbalanceSchema>;

export const GetwalletinfoResultSchema = z.object({
  walletname: z.string(),
  walletversion: z.number(),
  format: z.string(),
  balance: z.number(),
  unconfirmed_balance: z.number(),
  immature_balance: z.number(),
  txcount: z.number(),
  keypoolsize: z.number(),
  keypoolsize_hd_internal: z.number(),
  paytxfee: z.number(),
  private_keys_enabled: z.boolean(),
  avoid_reuse: z.boolean(),
  scanning: z.boolean(),
  descriptors: z.boolean(),
  external_signer: z.boolean(),
  blank: z.boolean(),
  birthtime: z.number(),
  lastprocessedblock: z.object({
    hash: z.string(),
    height: z.number(),
  }),
});
export type GetwalletinfoResult = z.infer<typeof GetwalletinfoResultSchema>;

export const GetwalletinfoSchema = z.object({
  result: GetwalletinfoResultSchema,
  error: z.any(),
  id: z.string(),
});
export type Getwalletinfo = z.infer<typeof GetwalletinfoSchema>;

export const ListtransactionsResultSchema = z.object({
  address: z.string(),
  category: z.string(),
  amount: z.number(),
  vout: z.number(),
  fee: z.number().optional(),
  confirmations: z.number(),
  blockhash: z.string(),
  blockheight: z.number(),
  blockindex: z.number(),
  blocktime: z.number(),
  txid: z.string(),
  wtxid: z.string(),
  walletconflicts: z.array(z.string()),
  mempoolconflicts: z.array(z.string()),
  time: z.number(),
  timereceived: z.number(),
  'bip125-replaceable': z.string(),
  abandoned: z.boolean(),
  parent_descs: z.array(z.string()).optional(),
  label: z.string().optional(),
});
export type ListtransactionsResult = z.infer<typeof ListtransactionsResultSchema>;

export const ListtransactionsSchema = z.object({
  result: z.array(ListtransactionsResultSchema),
  error: z.any(),
  id: z.string(),
});
export type Listtransactions = z.infer<typeof ListtransactionsSchema>;
