import { z } from 'zod';
import { ADDRESS_TYPES } from '@features/wallet/config/bitcoin';
import { UtxoSchema } from '@features/wallet/types/wallet';

export const FormNewAddressSchema = z.object({
  addressType: z
    .string()
    .refine((value) => ADDRESS_TYPES.some((type) => type.value === value), {
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

export const FormSendAdvancedSchema = z.object({
  utxos: z.array(UtxoSchema).min(1, { message: 'Select at least one UTXO' }),
  address: z.string().min(1, { message: 'Address is required' }),
  amount: z
    .number({ message: 'Amount must be a number' })
    .positive({ message: 'Amount must be greater than zero' }),
  addressChange: z.string().min(1, { message: 'Change address is required' }),
  amountChange: z
    .number({ message: 'Change must be a number' })
    .nonnegative({ message: 'Change must be ≥ 0' })
    .optional(),
});
export type FormSendAdvancedType = z.infer<typeof FormSendAdvancedSchema>;

export const FormBumpFeeSchema = z.object({
  fee_rate: z
    .number({ message: 'Fee Rate must be a number' })
    .positive({ message: 'Fee Rate must be greater than zero' }),
});
export type FormBumpFeeType = z.infer<typeof FormBumpFeeSchema>;

export const FormCPFPSendAdvancedSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  amount: z
    .number({ message: 'Amount must be a number' })
    .positive({ message: 'Amount must be greater than zero' }),
});
export type FormCPFPSendAdvancedType = z.infer<
  typeof FormCPFPSendAdvancedSchema
>;
