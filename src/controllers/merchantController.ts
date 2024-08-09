// src/controllers/merchantController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Merchant } from '../entity/Merchant';
import { z } from 'zod';
import { TokenSchema } from '../type/token';
import { MetadataSchema } from '../type/profile';

const merchantRepository = AppDataSource.getRepository(Merchant);
// Define the Zod schema for Merchant creation
const createMerchantSchema = z.object({
    id: z.string(),
    walletAddress: z.string(),
    baseToken: TokenSchema,
    metadata: MetadataSchema,
});
// creates a Merchant
export const createMerchant = async (req: Request, res: Response) => {
    try {
        const parseResult = createMerchantSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors });
        }

        const { id, baseToken, metadata, walletAddress } = parseResult.data;

        const merchant = new Merchant();
        merchant.id = id;
        merchant.baseToken = baseToken;
        merchant.metadata = metadata;
        merchant.walletAddress = walletAddress;
        merchant.offerings = [];

        const result = await merchantRepository.save(merchant);
        res.status(201).json({ insertedId: result.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create merchant' });
    }
};

// gets a Merchant
export const getMerchant = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const merchant = await merchantRepository.findOne({ where: { id: id } });
        if (!merchant) {
            res.status(404).json({ error: 'Merchant not found' });
        } else {
            res.json(merchant);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get merchant' });
    }
};

// get all Merchants
export const getMerchants = async (req: Request, res: Response) => {
    try {
        const merchants = await merchantRepository.find();
        res.json(merchants);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get merchants' });
    }
};

// update a Merchant
export const updateMerchant = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const merchant = await merchantRepository.findOne({ where: { id: id } });
        if (!merchant) {
            res.status(404).json({ error: 'Merchant not found' });
        } else {
            merchant.baseToken = req.body.baseToken;
            merchant.metadata = req.body.metadata;
            merchant.walletAddress = req.body.walletAddress;
            await merchantRepository.save(merchant);
            res.json(merchant);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update merchant' });
    }
};


// delete a Merchant
export const deleteMerchant = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const merchant = await merchantRepository.findOne({ where: { id: id } });
        if (!merchant) {
            res.status(404).json({ error: 'Merchant not found' });
        } else {
            await merchantRepository.remove(merchant);
            res.json({ id: id });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete merchant' });
    }
};

// get all offerings of a Merchant
export const getMerchantOfferings = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const merchant = await merchantRepository.findOne({ where: { id: id }, relations: ['offerings'] });
        if (!merchant) {
            res.status(404).json({ error: 'Merchant not found' });
        } else {
            res.json(merchant.offerings);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get merchant offerings' });
    }
};

// get all invoices of a Merchant
export const getMerchantInvoices = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const merchant = await merchantRepository.findOne({ where: { id: id }, relations: ['offerings', 'offerings.invoices'] });
        if (!merchant) {
            res.status(404).json({ error: 'Merchant not found' });
        } else {
            res.json(merchant.offerings.map(offering => offering.invoices));
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get merchant invoices' });
    }
};

// get all customers of a Merchant
export const getMerchantCustomers = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const merchant = await merchantRepository.findOne({ where: { id: id }, relations: ['offerings', 'offerings.invoices', 'offerings.invoices.customer'] });
        if (!merchant) {
            res.status(404).json({ error: 'Merchant not found' });
        } else {
            res.json(merchant.offerings.map(offering => offering.invoices.map(invoice => invoice.customer)));
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get merchant customers' });
    }
};

// get all payments of a Merchant
export const getMerchantPayments = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const merchant = await merchantRepository.findOne({ where: { id: id }, relations: ['offerings', 'offerings.invoices', 'offerings.invoices.payment'] });
        if (!merchant) {
            res.status(404).json({ error: 'Merchant not found' });
        } else {
            res.json(merchant.offerings.map(offering => offering.invoices.map(invoice => invoice.payment)));
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get merchant payments' });
    }
};

