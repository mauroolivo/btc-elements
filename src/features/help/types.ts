import { z } from 'zod';

import { RpcErrorSchema } from '@shared/types/rpc';

export const HelpSchema = z.object({
  result: z.string(),
  error: RpcErrorSchema.optional(),
  id: z.string(),
});
export type Help = z.infer<typeof HelpSchema>;