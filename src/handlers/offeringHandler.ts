import { Repository } from 'typeorm';
import { Offering } from '../entity/Offering';
import { AppDataSource } from '../data-source';

export class OfferingHandler {
    private repo: Repository<Offering>;

    constructor() {
        this.repo = AppDataSource.getRepository(Offering);
    }

    async getOffering(id: number) {
        try {
            return await this.repo.findOne({ where: { id }, relations: ['merchant', 'invoices'] });
        } catch (error) {
            console.error("Error while getting Offering:", error);
            throw error;
        }
    }

    async addOffering(offering: Offering) {
        try {
            return await this.repo.save(offering);
        } catch (error) {
            console.error("Error while adding Offering:", error);
            throw error;
        }
    }

    async updateOffering(offering: Offering) {
        try {
            const existing = await this.repo.findOne({ where: { id: offering.id } });
            if (existing) {
                return await this.repo.save(offering);
            } else {
                throw new Error(`Offering with ID ${offering.id} does not exist.`);
            }
        } catch (error) {
            console.error("Error while updating Offering:", error);
            throw error;
        }
    }

    async deleteOffering(id: number) {
        try {
            const offering = await this.repo.findOne({ where: { id } });
            if (offering) {
                return await this.repo.remove(offering);
            } else {
                throw new Error(`Offering with ID ${id} does not exist.`);
            }
        } catch (error) {
            console.error("Error while deleting Offering:", error);
            throw error;
        }
    }

    async getAllOfferings() {
        try {
            return await this.repo.find({ relations: ['merchant', 'invoices'] });
        } catch (error) {
            console.error("Error while getting all Offerings:", error);
            throw error;
        }
    }

    async getOfferingsByMerchant(merchantId: string) {
        try {
            return await this.repo.find({ where: { merchant: { id: merchantId } }, relations: ['invoices'] });
        } catch (error) {
            console.error("Error while getting Offerings by Merchant:", error);
            throw error;
        }
    }

    async getLiveOfferings() {
        try {
            return await this.repo.find({ where: { isLive: true }, relations: ['merchant', 'invoices'] });
        } catch (error) {
            console.error("Error while getting live Offerings:", error);
            throw error;
        }
    }

    async updateOfferingStock(id: number, stock: number) {
        try {
            const offering = await this.repo.findOne({ where: { id } });
            if (offering) {
                offering.stock = stock;
                return await this.repo.save(offering);
            } else {
                throw new Error(`Offering with ID ${id} does not exist.`);
            }
        } catch (error) {
            console.error("Error while updating Offering stock:", error);
            throw error;
        }
    }

    async toggleOfferingLiveStatus(id: number, isLive: boolean) {
        try {
            const offering = await this.repo.findOne({ where: { id } });
            if (offering) {
                offering.isLive = isLive;
                return await this.repo.save(offering);
            } else {
                throw new Error(`Offering with ID ${id} does not exist.`);
            }
        } catch (error) {
            console.error("Error while toggling Offering live status:", error);
            throw error;
        }
    }
}