export const SATOSHIS_PER_BITCOIN = 100_000_000;

export const ADDRESS_TYPES = [
  { value: 'legacy', label: 'Legacy' },
  { value: 'p2sh-segwit', label: 'P2SH-SegWit' },
  { value: 'bech32', label: 'Bech32 (native SegWit)' },
  { value: 'bech32m', label: 'Bech32m (Taproot)' },
  { value: 'invalid-vector', label: 'Invalid Vector' },
];
