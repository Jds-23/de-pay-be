import express from 'express';
import {
    createMerchant,
    getMerchant,
    getMerchants,
    getMerchantOfferings,
    getMerchantInvoices,
    getMerchantCustomers,
    getMerchantPayments
} from '../controllers/merchantController';


const router = express.Router();

router.post('/merchants', createMerchant);
router.get('/merchants/:id', getMerchant);
router.get('/merchants', getMerchants);
router.get('/merchants/:id/offerings', getMerchantOfferings);
router.get('/merchants/:id/invoices', getMerchantInvoices);
router.get('/merchants/:id/customers', getMerchantCustomers);
router.get('/merchants/:id/payments', getMerchantPayments);

export default router;