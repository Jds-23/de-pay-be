// src/routes/invoiceRoutes.ts
import express from 'express';
import { createInvoice, createInvoiceWithPayment, getInvoiceById } from '../controllers/invoiceController';

const router = express.Router();

router.post('/invoices', createInvoiceWithPayment);
router.get('/invoices/:id', getInvoiceById);
// router.get('/invoices', getAllInvoices);
// router.patch('/invoices/:id/payment-status', updateInvoicePaymentStatus);
// router.delete('/invoices/:id', deleteInvoice);

export default router;