import { z } from 'zod';
import { ADDRESS_TYPES } from '../constants';

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

export const FormNewAddressSchema = z.object({
  addressType: z
    .string()
    .refine((v) => ADDRESS_TYPES.some((t) => t.value === v), {
      message: 'Invalid address type',
    }),
});

export const FormSendSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  amount: z
    .number({ message: 'Amount must be a number' })
    .positive({ message: 'Amount must be greater than zero' }),
  fee_rate: z
    .number({ message: 'Fee Rate must be a number' })
    .positive({ message: 'Fee Rate must be greater than zero' }),
  replaceable: z.boolean(),
  subtractFeeFromAmount: z.boolean(),
});
export type FormSendType = z.infer<typeof FormSendSchema>;

export const SendtoaddressSchema = z.object({
  result: z.string().optional(), // txid
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Sendtoaddress = z.infer<typeof SendtoaddressSchema>;
