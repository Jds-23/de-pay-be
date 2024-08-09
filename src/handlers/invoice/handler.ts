import { Repository } from 'typeorm';
import { Invoice } from '../../entity/Invoice';
import { AppDataSource } from '../../data-source';
import { Customer } from '../../entity/Customer';
import { Offering } from '../../entity/Offering';
import { Payment } from '../../entity/Payment';
import { CreateInvoiceType } from './schema';
import { OfferingHandler } from '../offering/handler';
import { MerchantHandler } from '../merchant/handler';
import { CustomerHandler } from '../customer/handler';

export class InvoiceHandler {
    private repo: Repository<Invoice>;
    private merchantHandler: MerchantHandler;
    private offeringHandler: OfferingHandler;
    private customerHandler: CustomerHandler;

    constructor() {
        this.repo = AppDataSource.getRepository(Invoice);
        this.merchantHandler = new MerchantHandler();
        this.offeringHandler = new OfferingHandler();
        this.customerHandler = new CustomerHandler();
    }

    async getInvoice(id: number) {
        try {
            const invoice = await this.repo.findOne({ where: { id }, relations: ['customer', 'offering', 'payment'] });
            if (!invoice) {
                throw new Error(`Invoice with ID 1 does not exist.`);
            }
            return invoice;
        } catch (error) {
            console.error("Error while getting Invoice:", error);
            throw error;
        }
    }

    async createInvoice(createInvoiceParams: CreateInvoiceType) {
        try {
            let offering: Offering | null;
            if (createInvoiceParams.offeringId) {
                offering = await this.offeringHandler.getOffering(createInvoiceParams.offeringId);
                if (!offering) {
                    throw new Error(`Offering with ID ${createInvoiceParams.offeringId} does not exist.`);
                }
            } else {
                if (!createInvoiceParams.offering) {
                    throw new Error(`Offering is required`);
                }
                offering = await this.offeringHandler.createOffering(createInvoiceParams.offering);
            }
            let customer: Customer | null;
            if (createInvoiceParams.customerId) {
                customer = await this.customerHandler.getCustomer(createInvoiceParams.customerId);
                if (!customer) {
                    throw new Error(`Customer with ID ${createInvoiceParams.customerId} does not exist.`);
                }
            } else {
                if (!createInvoiceParams.customer) {
                    throw new Error(`Customer is required`);
                }
                customer = await this.customerHandler.createCustomer(createInvoiceParams.customer);
            }


            const invoice = new Invoice();
            invoice.customer = customer;
            invoice.offering = offering;
            invoice.date = new Date();
            invoice.paid = false;
            return await this.repo.save(invoice);
        } catch (error) {
            console.error("Error while adding Invoice:", error);
            throw error;
        }
    }


}