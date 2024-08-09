// src/controllers/invoiceController.ts
import { custom, z } from 'zod';
import { MetadataSchema } from '../type/profile';  // Assuming you have this defined for Metadata
import { TokenSchema } from '../type/token';       // Assuming you have this defined for Token
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Invoice } from '../entity/Invoice';
import { Offering } from '../entity/Offering';
import { Merchant } from '../entity/Merchant';

const createOfferingSchema = z.object({
    merchantId: z.string(),
    metadata: MetadataSchema,
    price: z.string().transform((val) => BigInt(val)),
    customToken: TokenSchema,
    stock: z.number(),
    isUnlimited: z.boolean(),
    isLive: z.boolean(),
});
// Define the Zod schema for Customer
const CustomerSchema = z.object({
    id: z.string(),
    walletAddress: z.string(),
    metadata: MetadataSchema,
    email: z.string().email(),
});
// Define the Zod schema for Invoice creation
const createInvoiceSchema = z.object({
    merchantId: z.string(),
    offeringId: z.number().optional(),
    createOfferingsParams: createOfferingSchema.optional(),
    customer: CustomerSchema,
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    paid: z.boolean(),
});


const invoiceRepository = AppDataSource.getRepository(Invoice);
const offeringRepository = AppDataSource.getRepository(Offering);
const merchantRepository = AppDataSource.getRepository(Merchant);


// Create an Invoice
export const createInvoice = async (req: Request, res: Response) => {
    try {
        const parseResult = createInvoiceSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors });
        }

        const { offeringId } = parseResult.data;

        // Check if the offering exists
        const offering = await offeringRepository.findOne({ where: { id: offeringId } });
        if (!offering) {
            return res.status(404).json({ error: 'Offering not found' });
        }

        const invoice = new Invoice();
        invoice.offering = offering;

        const result = await invoiceRepository.save(invoice);
        res.status(201).json({ id: result.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};

// Get an Invoice by ID
export const getInvoice = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const invoice = await invoiceRepository.findOne({ where: { id: parseInt(id) }, relations: ['offering'] });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get invoice' });
    }
};

// Get all Invoices
export const getInvoices = async (req: Request, res: Response) => {
    try {
        const invoices = await invoiceRepository.find({ relations: ['offering'] });
        res.json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get invoices' });
    }
};

// // Update an Invoice
// export const updateInvoice = async (req: Request, res: Response) => {
//     const id = req.params.id;
//     try {
//         const parseResult = updateInvoiceSchema.safeParse(req.body);
//         if (!parseResult.success) {
//             return res.status(400).json({ error: parseResult.error.errors });
//         }

//         const invoice = await invoiceRepository.findOne({ where: { id: parseInt(id) }, relations: ['offering'] });
//         if (!invoice) {
//             return res.status(404).json({ error: 'Invoice not found' });
//         }

//         const { customer, payment } = parseResult.data;


//         if (customer) invoice.customer = { ...invoice.customer, ...customer };
//         if (payment) invoice.payment = { ...invoice.payment, ...payment };

//         await invoiceRepository.save(invoice);
//         res.json(invoice);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to update invoice' });
//     }
// };

// Delete an Invoice
export const deleteInvoice = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const invoice = await invoiceRepository.findOne({ where: { id: parseInt(id) } });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        await invoiceRepository.remove(invoice);
        res.json({ id: id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
};