import { z } from "zod";

export const MetadataSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
});

export type Metadata = z.infer<typeof MetadataSchema>;