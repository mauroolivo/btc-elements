import { z } from "zod";

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
