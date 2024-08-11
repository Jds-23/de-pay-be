// src/controllers/invoiceController.ts
import { Request, Response } from 'express';
import { InvoiceHandler } from '../handlers/invoice/handler';
import { createInvoiceSchema } from '../handlers/invoice/schema';
import { PaymentHandler } from '../handlers/payment/handler';

const invoiceHandler = new InvoiceHandler();
const paymentHandler = new PaymentHandler();

// Creates a new Invoice
export const createInvoiceWithPayment = async (req: Request, res: Response) => {
    try {
        const parseResult = createInvoiceSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors });
        }

        const invoice = await invoiceHandler.createInvoice(parseResult.data);
        const payment = await paymentHandler.createPayment({ invoiceId: invoice.id });
        if (parseResult.data.txnHash && parseResult.data.paidAsset) {
            await paymentHandler.updatePaymentTxnhash(payment.id, parseResult.data.txnHash, parseResult.data.paidAsset);
        }
        res.status(201).json({ id: invoice.id });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error?.message || 'Failed to create invoice' });
    }
};
// Creates a new Invoice
export const createInvoice = async (req: Request, res: Response) => {
    try {
        const parseResult = createInvoiceSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors });
        }

        const invoice = await invoiceHandler.createInvoice(parseResult.data);
        // const payment = await paymentHandler.createPayment({ invoiceId: invoice.id });
        // if (parseResult.data.txnHash && parseResult.data.paidAsset) {
        //     await paymentHandler.updatePaymentTxnhash(payment.id, parseResult.data.txnHash, parseResult.data.paidAsset);
        // }
        res.status(201).json({ id: invoice.id });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error?.message || 'Failed to create invoice' });
    }
};

// Retrieves an Invoice by ID
export const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        const invoice = await invoiceHandler.getInvoice(id);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error?.message || 'Failed to retrieve invoice' });
    }
};

// // Retrieves all Invoices
// export const getAllInvoices = async (_req: Request, res: Response) => {
//     try {
//         const invoices = await invoiceHandler.getAllInvoices();
//         res.json(invoices);
//     } catch (error: any) {
//         console.error(error);
//         res.status(500).json({ error: error?.message || 'Failed to retrieve invoices' });
//     }
// };

// // Updates the payment status of an Invoice
// export const updateInvoicePaymentStatus = async (req: Request, res: Response) => {
//     try {
//         const id = parseInt(req.params.id);
//         const { paid } = req.body;

//         if (isNaN(id) || typeof paid !== 'boolean') {
//             return res.status(400).json({ error: 'Invalid ID or payment status' });
//         }

//         const invoice = await invoiceHandler.updateInvoicePaymentStatus(id, paid);
//         res.json(invoice);
//     } catch (error: any) {
//         console.error(error);
//         res.status(500).json({ error: error?.message || 'Failed to update invoice payment status' });
//     }
// };

// // Deletes an Invoice by ID
// export const deleteInvoice = async (req: Request, res: Response) => {
//     try {
//         const id = parseInt(req.params.id);
//         if (isNaN(id)) {
//             return res.status(400).json({ error: 'Invalid ID' });
//         }

//         await invoiceHandler.deleteInvoice(id);
//         res.status(204).send();
//     } catch (error: any) {
//         console.error(error);
//         res.status(500).json({ error: error?.message || 'Failed to delete invoice' });
//     }
// };





// // src/controllers/invoiceController.ts
// import { Request, Response } from 'express';
// import { InvoiceHandler } from '../handlers/invoiceHandler';
// import { z } from 'zod';
// import { AppDataSource } from '../data-source';
// import { Invoice } from '../entity/Invoice';
// import { Payment } from '../entity/Payment';
// import { Customer } from '../entity/Customer';
// import { Offering } from '../entity/Offering';

// const invoiceHandler = new InvoiceHandler();

// // Define the Zod schema for Invoice creation
// const createInvoiceSchema = z.object({
//     offeringId: z.number(),
//     customerId: z.string().optional().nullable(),
//     date: z.string().refine((val) => !isNaN(Date.parse(val)), {
//         message: "Invalid date format",
//     }),
//     paid: z.boolean(),
// });

// // Create an Invoice
// export const createInvoice = async (req: Request, res: Response) => {
//     try {
//         const parseResult = createInvoiceSchema.safeParse(req.body);
//         if (!parseResult.success) {
//             return res.status(400).json({ error: parseResult.error.errors });
//         }

//         const { offeringId, customerId, date, paid } = parseResult.data;

//         const offering = await AppDataSource.getRepository(Offering).findOne({ where: { id: offeringId } });
//         if (!offering) {
//             return res.status(404).json({ error: 'Offering not found' });
//         }

//         let customer: Customer | null = null;
//         if (customerId) {
//             customer = await AppDataSource.getRepository(Customer).findOne({ where: { id: customerId } });
//             if (!customer) {
//                 return res.status(404).json({ error: 'Customer not found' });
//             }
//         }



//         const invoice = new Invoice();
//         invoice.offering = offering;
//         invoice.customer = customer;
//         invoice.date = new Date(date);
//         invoice.paid = paid;

//         const result = await invoiceHandler.addInvoice(invoice);
//         res.status(201).json({ id: result.id });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to create invoice' });
//     }
// };

// // Get an Invoice by ID
// export const getInvoiceById = async (req: Request, res: Response) => {
//     try {
//         const invoiceId = parseInt(req.params.id, 10);
//         const invoice = await invoiceHandler.getInvoice(invoiceId);
//         if (!invoice) {
//             return res.status(404).json({ error: 'Invoice not found' });
//         }
//         res.json(invoice);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to get invoice' });
//     }
// };

// // Get all Invoices
// export const getAllInvoices = async (req: Request, res: Response) => {
//     try {
//         const invoices = await invoiceHandler.getAllInvoices();
//         res.json(invoices);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to get invoices' });
//     }
// };

// // Get Invoices by Customer ID
// export const getInvoicesByCustomer = async (req: Request, res: Response) => {
//     try {
//         const customerId = req.params.customerId;
//         const invoices = await invoiceHandler.getInvoicesByCustomer(customerId);
//         res.json(invoices);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to get invoices by customer' });
//     }
// };

// // Get Invoices by Offering ID
// export const getInvoicesByOffering = async (req: Request, res: Response) => {
//     try {
//         const offeringId = parseInt(req.params.offeringId, 10);
//         const invoices = await invoiceHandler.getInvoicesByOffering(offeringId);
//         res.json(invoices);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to get invoices by offering' });
//     }
// };
