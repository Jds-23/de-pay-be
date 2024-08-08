// src/controllers/merchantController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Merchant } from '../entity/Merchant';

const merchantRepository = AppDataSource.getRepository(Merchant);

export const createMerchant = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }
        console.log(typeof id);
        const merchant: Merchant = {
            id: id as string,
            address: req.body.address,
            description: req.body.description,
            imageUrl: req.body.imageUrl,
            name: req.body.name,
            offerings: [],
            // name: req.body.name,
            // Add other properties as needed
        }
        // merchant.name = req.body.name;
        const result = await merchantRepository.save(merchant);
        res.status(201).json({ insertedId: result.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create merchant' });
    }
};

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