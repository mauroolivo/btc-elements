import {
  FormBumpFeeSchema,
  FormCPFPSendAdvancedSchema,
  FormNewAddressSchema,
  FormSendAdvancedSchema,
  FormSendSchema,
} from './forms';
import { ADDRESS_TYPES } from '@features/wallet/config/bitcoin';

describe('wallet schemas', () => {
  const validAddressType = ADDRESS_TYPES[0]?.value ?? 'bech32';

  describe('FormNewAddressSchema', () => {
    it('accepts a supported address type', () => {
      const result = FormNewAddressSchema.safeParse({
        addressType: validAddressType,
      });

      expect(result.success).toBe(true);
    });

    it('rejects an unsupported address type', () => {
      const result = FormNewAddressSchema.safeParse({
        addressType: 'unsupported-type',
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('Invalid address type');
    });
  });

  describe('FormSendSchema', () => {
    const validPayload = {
      address: 'tb1qexampleaddress',
      amount: 0.1,
      fee_rate: 2,
      replaceable: true,
      subtractFeeFromAmount: false,
    };

    it('accepts a valid send payload', () => {
      const result = FormSendSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects empty address', () => {
      const result = FormSendSchema.safeParse({
        ...validPayload,
        address: '',
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('Address is required');
    });

    it('rejects non-positive amount', () => {
      const result = FormSendSchema.safeParse({
        ...validPayload,
        amount: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(
        'Amount must be greater than zero'
      );
    });

    it('rejects non-positive fee rate', () => {
      const result = FormSendSchema.safeParse({
        ...validPayload,
        fee_rate: -1,
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(
        'Fee Rate must be greater than zero'
      );
    });
  });

  describe('FormSendAdvancedSchema', () => {
    const validUtxo = {
      txid: 'abc123',
      vout: 0,
      address: 'tb1qexampleaddress',
      amount: 0.5,
      confirmations: 3,
      spendable: true,
      solvable: true,
      desc: 'wpkh([fingerprint/84h/1h/0h]xpub/0/*)#checksum',
      safe: true,
      label: 'utxo-1',
    };

    const validPayload = {
      utxos: [validUtxo],
      address: 'tb1qrecipientaddress',
      amount: 0.1,
      addressChange: 'tb1qchangeaddress',
      amountChange: 0.39,
    };

    it('accepts a valid advanced send payload', () => {
      const result = FormSendAdvancedSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects an empty utxo selection', () => {
      const result = FormSendAdvancedSchema.safeParse({
        ...validPayload,
        utxos: [],
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('Select at least one UTXO');
    });

    it('rejects negative amountChange', () => {
      const result = FormSendAdvancedSchema.safeParse({
        ...validPayload,
        amountChange: -0.01,
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('Change must be ≥ 0');
    });
  });

  describe('FormBumpFeeSchema', () => {
    it('accepts positive fee rate', () => {
      const result = FormBumpFeeSchema.safeParse({ fee_rate: 1.25 });
      expect(result.success).toBe(true);
    });

    it('rejects zero fee rate', () => {
      const result = FormBumpFeeSchema.safeParse({ fee_rate: 0 });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(
        'Fee Rate must be greater than zero'
      );
    });
  });

  describe('FormCPFPSendAdvancedSchema', () => {
    it('accepts valid cpfp payload', () => {
      const result = FormCPFPSendAdvancedSchema.safeParse({
        address: 'tb1qrecipientaddress',
        amount: 0.01,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty address', () => {
      const result = FormCPFPSendAdvancedSchema.safeParse({
        address: '',
        amount: 0.01,
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('Address is required');
    });
  });
});
