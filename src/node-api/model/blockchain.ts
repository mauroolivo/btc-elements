import { z } from "zod";

export const GetblockchaininfoSchema = z.object({
  result: z.object({
    chain: z.string(),
    blocks: z.number(),
    headers: z.number(),
    bestblockhash: z.string(),
    difficulty: z.number(),
    time: z.number(),
    mediantime: z.number(),
    verificationprogress: z.number(),
    initialblockdownload: z.boolean(),
    chainwork: z.string(),
    size_on_disk: z.number(),
    pruned: z.boolean(),
    warnings: z.array(z.string()),
  }),
  // error: z.any(),
  id: z.string(),
});
export type Getblockchaininfo = z.infer<typeof GetblockchaininfoSchema>;
