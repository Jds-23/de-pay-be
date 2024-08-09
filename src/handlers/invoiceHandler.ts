import { Repository } from 'typeorm';
import { Invoice } from '../entity/Invoice';
import { AppDataSource } from '../data-source';
import { Customer } from '../entity/Customer';
import { Offering } from '../entity/Offering';
import { Payment } from '../entity/Payment';

export class InvoiceHandler {
    private repo: Repository<Invoice>;

    constructor() {
        this.repo = AppDataSource.getRepository(Invoice);
    }

    async getInvoice(id: number) {
        try {
            return await this.repo.findOne({ where: { id }, relations: ['customer', 'offering', 'payment'] });
        } catch (error) {
            console.error("Error while getting Invoice:", error);
            throw error;
        }
    }

    async addInvoice(invoice: Invoice) {
        try {
            return await this.repo.save(invoice);
        } catch (error) {
            console.error("Error while adding Invoice:", error);
            throw error;
        }
    }

    async updateInvoice(invoice: Invoice) {
        try {
            const existing = await this.repo.findOne({ where: { id: invoice.id } });
            if (existing) {
                return await this.repo.save(invoice);
            } else {
                throw new Error(`Invoice with ID ${invoice.id} does not exist.`);
            }
        } catch (error) {
            console.error("Error while updating Invoice:", error);
            throw error;
        }
    }

    async deleteInvoice(id: number) {
        try {
            const invoice = await this.repo.findOne({ where: { id } });
            if (invoice) {
                return await this.repo.remove(invoice);
            } else {
                throw new Error(`Invoice with ID ${id} does not exist.`);
            }
        } catch (error) {
            console.error("Error while deleting Invoice:", error);
            throw error;
        }
    }

    async getAllInvoices() {
        try {
            return await this.repo.find({ relations: ['customer', 'offering', 'payment'] });
        } catch (error) {
            console.error("Error while getting all Invoices:", error);
            throw error;
        }
    }

    async getInvoicesByCustomer(customerId: string) {
        try {
            return await this.repo.find({ where: { customer: { id: customerId } }, relations: ['offering', 'payment'] });
        } catch (error) {
            console.error("Error while getting Invoices by Customer:", error);
            throw error;
        }
    }

    async getInvoicesByOffering(offeringId: number) {
        try {
            return await this.repo.find({ where: { offering: { id: offeringId } }, relations: ['customer', 'payment'] });
        } catch (error) {
            console.error("Error while getting Invoices by Offering:", error);
            throw error;
        }
    }

    async markInvoiceAsPaid(id: number, payment: Payment) {
        try {
            const invoice = await this.repo.findOne({ where: { id }, relations: ['payment'] });
            if (invoice) {
                invoice.paid = true;
                invoice.payment = payment;
                return await this.repo.save(invoice);
            } else {
                throw new Error(`Invoice with ID ${id} does not exist.`);
            }
        } catch (error) {
            console.error("Error while marking Invoice as paid:", error);
            throw error;
        }
    }
}