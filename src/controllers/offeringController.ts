// src/controllers/offeringController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Offering } from '../entity/Offering';
import { Merchant } from '../entity/Merchant';
import { z } from 'zod';
import { MetadataSchema } from '../type/profile';
import { TokenSchema } from '../type/token';

const offeringRepository = AppDataSource.getRepository(Offering);
const merchantRepository = AppDataSource.getRepository(Merchant);
const createOfferingSchema = z.object({
    merchantId: z.string(),
    metadata: MetadataSchema,
    price: z.string().transform((val) => BigInt(val)),
    customToken: TokenSchema,
    stock: z.number(),
    isUnlimited: z.boolean(),
    isLive: z.boolean(),
});
// Creates an Offering
export const createOffering = async (req: Request, res: Response) => {
    try {
        const parseResult = createOfferingSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors });
        }

        const { merchantId, metadata, price, customToken, stock, isUnlimited, isLive } = parseResult.data;

        // Check if the merchant exists
        const merchant = await merchantRepository.findOne({ where: { id: merchantId } });
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

        const result = await offeringRepository.save(offering);
        res.status(201).json({ id: result.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create offering' });
    }
};
// Retrieves Offerings by Merchant ID
export const getOfferingsByMerchant = async (req: Request, res: Response) => {
    try {
        const merchantId = req.params.merchantId;

        const merchant = await merchantRepository.findOne({ where: { id: merchantId }, relations: ['offerings'] });
        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }
        res.json(merchant.offerings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get offerings' });
    }
};
// Retrieves a single Offering by ID
export const getOfferingById = async (req: Request, res: Response) => {
    try {
        const offeringId = req.params.id;

        const offering = await offeringRepository.findOne({ where: { id: parseInt(offeringId) } });
        if (!offering) {
            return res.status(404).json({ error: 'Offering not found' });
        }

        res.json(offering);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get offering' });
    }
};