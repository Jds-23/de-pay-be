// src/controllers/invoiceController.ts
import { Request, Response } from 'express';
import { InvoiceHandler } from '../handlers/invoiceHandler';
import { z } from 'zod';
import { AppDataSource } from '../data-source';
import { Invoice } from '../entity/Invoice';
import { Payment } from '../entity/Payment';
import { Customer } from '../entity/Customer';
import { Offering } from '../entity/Offering';

const invoiceHandler = new InvoiceHandler();

// Define the Zod schema for Invoice creation
const createInvoiceSchema = z.object({
    offeringId: z.number(),
    customerId: z.string().optional().nullable(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    paid: z.boolean(),
});

// Create an Invoice
export const createInvoice = async (req: Request, res: Response) => {
    try {
        const parseResult = createInvoiceSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors });
        }

        const { offeringId, customerId, date, paid } = parseResult.data;

        const offering = await AppDataSource.getRepository(Offering).findOne({ where: { id: offeringId } });
        if (!offering) {
            return res.status(404).json({ error: 'Offering not found' });
        }

        let customer: Customer | null = null;
        if (customerId) {
            customer = await AppDataSource.getRepository(Customer).findOne({ where: { id: customerId } });
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found' });
            }
        }



        const invoice = new Invoice();
        invoice.offering = offering;
        invoice.customer = customer;
        invoice.date = new Date(date);
        invoice.paid = paid;

        const result = await invoiceHandler.addInvoice(invoice);
        res.status(201).json({ id: result.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};

// Get an Invoice by ID
export const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const invoiceId = parseInt(req.params.id, 10);
        const invoice = await invoiceHandler.getInvoice(invoiceId);
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
export const getAllInvoices = async (req: Request, res: Response) => {
    try {
        const invoices = await invoiceHandler.getAllInvoices();
        res.json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get invoices' });
    }
};

// Get Invoices by Customer ID
export const getInvoicesByCustomer = async (req: Request, res: Response) => {
    try {
        const customerId = req.params.customerId;
        const invoices = await invoiceHandler.getInvoicesByCustomer(customerId);
        res.json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get invoices by customer' });
    }
};

// Get Invoices by Offering ID
export const getInvoicesByOffering = async (req: Request, res: Response) => {
    try {
        const offeringId = parseInt(req.params.offeringId, 10);
        const invoices = await invoiceHandler.getInvoicesByOffering(offeringId);
        res.json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get invoices by offering' });
    }
};
