import { z } from 'zod';

// Define the Zod schema
export const TokenSchema = z.object({
    symbol: z.string(),
    address: z.string(),
    chainId: z.string(), // Changed to string
    decimals: z.number(),
    receiverWallet: z.string(),
});

// Derive the TypeScript type from the schema
export type Token = z.infer<typeof TokenSchema>;
