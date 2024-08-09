// src/handlers/MerchantHandler.ts
import { Repository } from 'typeorm';
import { Merchant } from '../entity/Merchant';
import { AppDataSource } from '../data-source';

export class MerchantHandler {
    private repo: Repository<Merchant>;

    constructor() {
        this.repo = AppDataSource.getRepository(Merchant);
    }

    async getMerchant(id: string) {
        return await this.repo.findOne({ where: { id }, relations: ['offerings'] });
    }

    async addMerchant(merchant: Merchant) {
        const existing = await this.repo.findOne({ where: { id: merchant.id } });
        if (!existing) {
            return await this.repo.save(merchant);
        } else {
            throw new Error(`Merchant with ID ${merchant.id} already exists.`);
        }
    }

    async updateMerchant(merchant: Merchant) {
        const existing = await this.repo.findOne({ where: { id: merchant.id } });
        if (existing) {
            return await this.repo.save(merchant);
        } else {
            throw new Error(`Merchant with ID ${merchant.id} does not exist.`);
        }
    }

    async deleteMerchant(id: string) {
        const merchant = await this.repo.findOne({ where: { id } });
        if (merchant) {
            return await this.repo.remove(merchant);
        } else {
            throw new Error(`Merchant with ID ${id} does not exist.`);
        }
    }

    async getAllMerchants() {
        return await this.repo.find();
    }

    async getMerchantOfferings(id: string) {
        const merchant = await this.repo.findOne({ where: { id }, relations: ['offerings'] });
        if (merchant) {
            return merchant.offerings;
        } else {
            throw new Error(`Merchant with ID ${id} does not exist.`);
        }
    }

    async getMerchantInvoices(id: string) {
        const merchant = await this.repo.findOne({ where: { id }, relations: ['offerings', 'offerings.invoices'] });
        if (merchant) {
            return merchant.offerings.flatMap(offering => offering.invoices);
        } else {
            throw new Error(`Merchant with ID ${id} does not exist.`);
        }
    }

    async getMerchantCustomers(id: string) {
        const merchant = await this.repo.findOne({ where: { id }, relations: ['offerings', 'offerings.invoices', 'offerings.invoices.customer'] });
        if (merchant) {
            return merchant.offerings.flatMap(offering => offering.invoices.map(invoice => invoice.customer));
        } else {
            throw new Error(`Merchant with ID ${id} does not exist.`);
        }
    }

    async getMerchantPayments(id: string) {
        const merchant = await this.repo.findOne({ where: { id }, relations: ['offerings', 'offerings.invoices', 'offerings.invoices.payment'] });
        if (merchant) {
            return merchant.offerings.flatMap(offering => offering.invoices.map(invoice => invoice.payment));
        } else {
            throw new Error(`Merchant with ID ${id} does not exist.`);
        }
    }
}