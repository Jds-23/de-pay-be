import { custom, z } from "zod";
import { TokenSchema } from "../../type/token";
import { MetadataSchema } from "../../type/profile";
import { createOfferingSchema } from "../offering/schema";
import { createCustomerSchema } from "../customer/schema";

// Define the Zod schema for Invoice creation
const createInvoiceSchema = z.object({
    // customer: Create
    offeringId: z.number().optional(),
    offering: createOfferingSchema.optional(),
    customerId: z.string().optional(),
    customer: createCustomerSchema.optional(),
    txnHash: z.string().optional(),
    paidAsset: TokenSchema.optional(),
    date: z.string(),
});

type CreateInvoiceType = z.infer<typeof createInvoiceSchema>;

export { createInvoiceSchema, CreateInvoiceType };