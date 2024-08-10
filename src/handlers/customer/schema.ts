import { z } from "zod";
import { TokenSchema } from "../../type/token";
import { MetadataSchema } from "../../type/profile";

// Define the Zod schema for Customer creation
const createCustomerSchema = z.object({
    walletAddress: z.string(),
    email: z.string().optional(),
    baseToken: TokenSchema.optional(),
    metadata: MetadataSchema.optional(),
});

type CreateCustomerType = z.infer<typeof createCustomerSchema>;

export { createCustomerSchema, CreateCustomerType };