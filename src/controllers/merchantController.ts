// src/controllers/merchantController.ts
import { Request, Response } from 'express';
import { MerchantHandler } from '../handlers/merchant/handler';
import { createMerchantSchema } from '../handlers/merchant/schema';
import { CustomerHandler } from '../handlers/customer/handler';
import { createSiweMessage, generateSiweNonce } from 'viem/siwe';
import auth from '../utils/auth';

const merchantHandler = new MerchantHandler();
const customerHandler = new CustomerHandler();

export const getMerchantRegisterNonce = async (req: Request, res: Response) => {
    try {
        const nonce = generateSiweNonce();
        res.json({ nonce });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate nonce' });
    }
}
// Creates a Merchant
export const createMerchant = async (req: Request, res: Response) => {
    try {
        const parseResult = createMerchantSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors });
        }
        // auth(req, req.body.walletAddress);
        await merchantHandler.createMerchant(parseResult.data);
        await customerHandler.createCustomer({ id: parseResult.data.walletAddress, walletAddress: parseResult.data.walletAddress, metadata: parseResult.data.metadata });
        res.status(201).json({ insertedId: parseResult.data.id });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error?.message || 'Failed to create merchant' });
    }
};

// Gets a Merchant
export const getMerchant = async (req: Request, res: Response) => {
    try {
        const merchant = await merchantHandler.getMerchant(req.params.id);
        if (!merchant) {
            res.status(404).json({ error: 'Merchant not found' });
        } else {
            res.json(merchant);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get merchant' });
    }
};

// Get all Merchants
export const getMerchants = async (req: Request, res: Response) => {
    try {
        const merchants = await merchantHandler.getAllMerchants();
        res.json(merchants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get merchants' });
    }
};

// // Update a Merchant
// export const updateMerchant = async (req: Request, res: Response) => {
//     const id = req.params.id;
//     try {
//         const merchant = await merchantHandler.getMerchant(id);
//         if (!merchant) {
//             res.status(404).json({ error: 'Merchant not found' });
//         } else {
//             merchant.baseToken = req.body.baseToken;
//             merchant.metadata = req.body.metadata;
//             merchant.walletAddress = req.body.walletAddress;
//             const updatedMerchant = await merchantHandler.updateMerchant(merchant);
//             res.json(updatedMerchant);
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to update merchant' });
//     }
// };

// Delete a Merchant
export const deleteMerchant = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        await merchantHandler.deleteMerchant(id);
        res.json({ id: id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete merchant' });
    }
};

// Get all offerings of a Merchant
export const getMerchantOfferings = async (req: Request, res: Response) => {
    try {
        const offerings = await merchantHandler.getMerchantOfferings(req.params.id);
        res.json(offerings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get merchant offerings' });
    }
};

// Get all invoices of a Merchant
export const getMerchantInvoices = async (req: Request, res: Response) => {
    try {
        const invoices = await merchantHandler.getMerchantInvoices(req.params.id);
        res.json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get merchant invoices' });
    }
};

// Get all customers of a Merchant
export const getMerchantCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await merchantHandler.getMerchantCustomers(req.params.id);
        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get merchant customers' });
    }
};

// Get all payments of a Merchant
export const getMerchantPayments = async (req: Request, res: Response) => {
    try {
        const payments = await merchantHandler.getMerchantPayments(req.params.id);
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get merchant payments' });
    }
};