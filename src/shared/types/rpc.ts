import { z } from 'zod';

export const RpcErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
});
export type RpcErrorType = z.infer<typeof RpcErrorSchema>;