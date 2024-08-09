import { z } from "zod";
import { TokenSchema } from "../../type/token";
import { MetadataSchema } from "../../type/profile";

// Define the Zod schema for Merchant creation
const createMerchantSchema = z.object({
    id: z.string(),
    walletAddress: z.string(),
    baseToken: TokenSchema,
    metadata: MetadataSchema,
});

type CreateMerchantType = z.infer<typeof createMerchantSchema>;

export { createMerchantSchema, CreateMerchantType };