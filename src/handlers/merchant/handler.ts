// src/handlers/MerchantHandler.ts
import { Repository } from 'typeorm';
import { Merchant } from '../../entity/Merchant';
import { AppDataSource } from '../../data-source';
import { CreateMerchantType } from './schema';

export class MerchantHandler {
    private repo: Repository<Merchant>;

    constructor() {
        this.repo = AppDataSource.getRepository(Merchant);
    }

    async getMerchant(id: string) {
        try {
            const existing = await this.repo.findOne({ where: { id }, relations: ['offerings'] });
            if (!existing) {
                throw new Error(`Merchant with ID ${id} does not exist.`);
            }
            return existing;
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to get merchant');
        }
    }

    async createMerchant(createMerchantParams: CreateMerchantType) {
        try {
            const existing = await this.repo.findOne({ where: { id: createMerchantParams.id } });
            if (!existing) {
                const merchant = new Merchant();
                merchant.id = createMerchantParams.id;
                merchant.baseToken = createMerchantParams.baseToken;
                merchant.metadata = createMerchantParams.metadata;
                merchant.walletAddress = createMerchantParams.walletAddress;
                merchant.offerings = [];
                return await this.repo.save(merchant);
            } else {
                throw new Error(`Merchant with ID ${createMerchantParams.id} already exists.`);
            }
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to create merchant');
        }
    }
    // async addMerchant(merchant: Merchant) {
    //     const existing = await this.repo.findOne({ where: { id: merchant.id } });
    //     if (!existing) {
    //         return await this.repo.save(merchant);
    //     } else {
    //         throw new Error(`Merchant with ID ${merchant.id} already exists.`);
    //     }
    // }

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