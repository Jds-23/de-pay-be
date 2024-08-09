// src/routes/offeringRoutes.ts
import express from 'express';
import { createOffering, getOfferingById, getAllOfferings, updateOfferingStock, deleteOffering } from '../controllers/offeringController';

const router = express.Router();

router.post('/offerings', createOffering);
router.get('/offerings/:id', getOfferingById);
router.get('/offerings', getAllOfferings);
router.patch('/offerings/:id/stock', updateOfferingStock);
router.delete('/offerings/:id', deleteOffering);

export default router;