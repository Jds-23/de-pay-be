// src/controllers/offeringController.ts
import { Request, Response } from 'express';
import { OfferingHandler } from '../handlers/offeringHandler'; // Import OfferingHandler
import { z } from 'zod';
import { MetadataSchema } from '../type/profile';
import { TokenSchema } from '../type/token';
import { Offering } from '../entity/Offering';
import { MerchantHandler } from '../handlers/merchantHandler';
import { createOfferingSchema } from '../handlers/offering/schema';

const offeringHandler = new OfferingHandler(); // Initialize OfferingHandler
const merchantHandler = new MerchantHandler();

// const createOfferingSchema = z.object({
//     merchantId: z.string(),
//     metadata: MetadataSchema,
//     price: z.string().transform((val) => BigInt(val)),
//     customToken: TokenSchema,
//     stock: z.number(),
//     isUnlimited: z.boolean(),
//     isLive: z.boolean(),
// });

// Creates an Offering
export const createOffering = async (req: Request, res: Response) => {
    try {
        const parseResult = createOfferingSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors });
        }

        const { merchantId, metadata, price, customToken, stock, isUnlimited, isLive } = parseResult.data;

        // Check if the merchant exists
        // const merchant = await offeringHandler.repo.manager.findOne('Merchant', { where: { id: merchantId } });
        const merchant = await merchantHandler.getMerchant(merchantId);
        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }

        const offering = new Offering();
        offering.metadata = metadata;
        offering.price = price;
        offering.customToken = customToken;
        offering.stock = stock;
        offering.isUnlimited = isUnlimited;
        offering.isLive = isLive;
        offering.merchant = merchant;

        const result = await offeringHandler.addOffering(offering);
        res.status(201).json({ id: result.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create offering' });
    }
};

// Retrieves a single Offering by ID
export const getOfferingById = async (req: Request, res: Response) => {
    try {
        const offeringId = parseInt(req.params.id, 10);
        const offering = await offeringHandler.getOffering(offeringId);
        if (!offering) {
            return res.status(404).json({ error: 'Offering not found' });
        }
        res.json(offering);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get offering' });
    }
};