import { z } from 'zod';
// import { ADDRESS_TYPES } from '../constants';

export const RpcErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
});
export type RpcErrorType = z.infer<typeof RpcErrorSchema>;

export const ListwalletdirSchema = z.object({
  result: z.object({
    wallets: z.array(
      z.object({
        name: z.string(),
      })
    ),
  }),
  error: z.object(RpcErrorSchema).optional(),
  id: z.string(),
});
export type Listwalletdir = z.infer<typeof ListwalletdirSchema>;

export const ListwalletsSchema = z.object({
  result: z.array(z.string()),
  error: z.object(RpcErrorSchema).optional(),
  id: z.string(),
});
export type Listwallets = z.infer<typeof ListwalletsSchema>;

export const LoadwalletSchema = z.object({
  result: z.object({}),
  error: z.object(RpcErrorSchema).optional(),
  id: z.string(),
});
export type Loadwallet = z.infer<typeof LoadwalletSchema>;

export const UnloadwalletSchema = z.object({
  result: z.object({}),
  error: z.object(RpcErrorSchema).optional(),
  id: z.string(),
});
export type Unloadwallet = z.infer<typeof UnloadwalletSchema>;

export const GetbalanceSchema = z.object({
  result: z.number(),
  error: z.object(RpcErrorSchema).optional(),
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
  error: z.object(RpcErrorSchema).optional(),
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
export type ListtransactionsResult = z.infer<
  typeof ListtransactionsResultSchema
>;

export const ListtransactionsSchema = z.object({
  result: z.array(ListtransactionsResultSchema),
  error: z.object(RpcErrorSchema).optional(),
  id: z.string(),
});
export type Listtransactions = z.infer<typeof ListtransactionsSchema>;

export const NewaddressSchema = z.object({
  result: z.string(),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Newaddress = z.infer<typeof NewaddressSchema>;

export const SendtoaddressSchema = z.object({
  result: z.string().optional(), // txid
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Sendtoaddress = z.infer<typeof SendtoaddressSchema>;

export const UtxoSchema = z.object({
  txid: z.string(),
  vout: z.number(),
  address: z.string(),
  amount: z.number(),
  confirmations: z.number(),
  spendable: z.boolean(),
  solvable: z.boolean(),
  desc: z.string(),
  safe: z.boolean(),
  label: z.string().optional(),
});
export type Utxo = z.infer<typeof UtxoSchema>;
export const ListunspentSchema = z.object({
  result: z.array(UtxoSchema).optional(),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Listunspent = z.infer<typeof ListunspentSchema>;

// Get Raw Change Address
export const GetrawchangeaddressSchema = z.object({
  result: z.string().optional(),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Getrawchangeaddress = z.infer<typeof GetrawchangeaddressSchema>;

export const CreaterawtransactionSchema = z.object({
  result: z.string().optional(),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Createrawtransaction = z.infer<typeof CreaterawtransactionSchema>;

export const SignrawtransactionwithwalletSchema = z.object({
  result: z
    .object({
      hex: z.string(),
      complete: z.boolean(),
    })
    .optional(),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Signrawtransactionwithwallet = z.infer<
  typeof SignrawtransactionwithwalletSchema
>;

export const BroadcastResponseSchena = z.object({
  result: z.string().optional(),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type BroadcastResponse = z.infer<typeof BroadcastResponseSchena>;

export const ListaddressgroupingsSchema = z.object({
  result: z.array(
    z.array(z.array(z.union([z.string(), z.number(), z.string()])))
  ),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Listaddressgroupings = z.infer<typeof ListaddressgroupingsSchema>;

export const GetaddressinfoSchema = z.object({
  result: z.object({
    address: z.string(),
    scriptPubKey: z.string(),
    ismine: z.boolean(),
    solvable: z.boolean(),
    desc: z.string(),
    parent_desc: z.string(),
    iswatchonly: z.boolean(),
    isscript: z.boolean(),
    iswitness: z.boolean(),
    script: z.string(),
    hex: z.string(),
    pubkey: z.string(),
    embedded: z.object({
      isscript: z.boolean(),
      iswitness: z.boolean(),
      witness_version: z.number(),
      witness_program: z.string(),
      pubkey: z.string(),
      address: z.string(),
      scriptPubKey: z.string(),
    }),
    ischange: z.boolean(),
    timestamp: z.number(),
    hdkeypath: z.string(),
    hdseedid: z.string(),
    hdmasterfingerprint: z.string(),
    labels: z.array(z.any()),
  }),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Getaddressinfo = z.infer<typeof GetaddressinfoSchema>;

export const GetdescriptorinfoSchema = z.object({
  result: z.object({
    descriptor: z.string(),
    checksum: z.string(),
    isrange: z.boolean(),
    issolvable: z.boolean(),
    hasprivatekeys: z.boolean(),
  }),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Getdescriptorinfo = z.infer<typeof GetdescriptorinfoSchema>;
