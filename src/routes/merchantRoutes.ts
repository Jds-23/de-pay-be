// src/routes/merchantRoutes.ts
import { Router } from 'express';
import { createMerchant, getMerchant } from '../controllers/merchantController';

const router = Router();

router.post('/merchants', createMerchant);
router.get('/merchants/:id', getMerchant);

export default router;