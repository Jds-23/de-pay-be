import { z } from "zod";

export const createPaymentSchema = z.object({
    invoiceId: z.number(),
});

export type CreatePaymentType = z.infer<typeof createPaymentSchema>;