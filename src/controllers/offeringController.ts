// src/controllers/offeringController.ts
import { Request, Response } from 'express';
import { OfferingHandler } from '../handlers/offering/handler';
import { createOfferingSchema } from '../handlers/offering/schema';

const offeringHandler = new OfferingHandler();
// Creates a new Offering
export const createOffering = async (req: Request, res: Response) => {
    try {
        const parseResult = createOfferingSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors });
        }

        const offering = await offeringHandler.createOffering(parseResult.data);
        res.status(201).json({ id: offering.id });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error?.message || 'Failed to create offering' });
    }
};

// Retrieves an Offering by ID
export const getOfferingById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        const offering = await offeringHandler.getOffering(id);
        if (!offering) {
            return res.status(404).json({ error: 'Offering not found' });
        }

        res.json(offering);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error?.message || 'Failed to retrieve offering' });
    }
};

// Retrieves all Offerings
export const getAllOfferings = async (_req: Request, res: Response) => {
    try {
        const offerings = await offeringHandler.getAllOfferings();
        res.json(offerings);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error?.message || 'Failed to retrieve offerings' });
    }
};

// Updates an Offering's stock
export const updateOfferingStock = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { stock } = req.body;

        if (isNaN(id) || typeof stock !== 'number') {
            return res.status(400).json({ error: 'Invalid ID or stock value' });
        }

        const offering = await offeringHandler.updateOfferingStock(id, stock);
        res.json(offering);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error?.message || 'Failed to update offering stock' });
    }
};

// Deletes an Offering by ID
export const deleteOffering = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        await offeringHandler.deleteOffering(id);
        res.status(204).send();
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error?.message || 'Failed to delete offering' });
    }
};