import { z } from "zod";
import { TokenSchema } from "../../type/token";
import { MetadataSchema } from "../../type/profile";

// Define the Zod schema for Offering creation
const createOfferingSchema = z.object({
    id: z.number(),
    price: z.string(),
    customToken: TokenSchema.optional(),
    metadata: MetadataSchema,
    stock: z.number(),
    isUnlimited: z.boolean(),
    merchantId: z.string(),
});

type CreateOfferingType = z.infer<typeof createOfferingSchema>;

export { createOfferingSchema, CreateOfferingType };