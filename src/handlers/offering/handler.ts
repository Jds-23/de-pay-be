import { Repository } from 'typeorm';
import { Offering } from '../../entity/Offering';
import { AppDataSource } from '../../data-source';
import { CreateOfferingType } from './schema';
import { MerchantHandler } from '../merchant/handler';

export class OfferingHandler {
    private repo: Repository<Offering>;
    private merchantHandler: MerchantHandler;

    constructor() {
        this.repo = AppDataSource.getRepository(Offering);
        this.merchantHandler = new MerchantHandler();
    }

    async getOffering(id: number) {
        try {
            return await this.repo.findOne({ where: { id }, relations: ['merchant', 'invoices'] });
        } catch (error) {
            console.error("Error while getting Offering:", error);
            throw error;
        }
    }

    async createOffering(createOfferingParams: CreateOfferingType) {
        try {
            const existing = await this.repo.findOne({ where: { id: createOfferingParams.id } });
            if (!existing) {
                const merchant = await this.merchantHandler.getMerchant(createOfferingParams.merchantId);
                if (!merchant) {
                    throw new Error(`Merchant with ID ${createOfferingParams.merchantId} does not exist.`);
                }

                const offering = new Offering();
                offering.id = createOfferingParams.id;
                offering.metadata = createOfferingParams.metadata;
                offering.price = BigInt(createOfferingParams.price);
                offering.customToken = createOfferingParams.customToken ?? merchant.baseToken;
                offering.stock = createOfferingParams.stock;
                offering.isUnlimited = createOfferingParams.isUnlimited;
                offering.isLive = true;
                offering.merchant = merchant;

                return await this.repo.save(offering);
            } else {
                throw new Error(`Offering with ID ${createOfferingParams.id} already exists.`);
            }
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
                if (offering.isUnlimited) {
                    throw new Error(`Offering with ID ${id} is unlimited stock.`);
                }
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