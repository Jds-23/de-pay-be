// src/handlers/payment/PaymentHandler.ts
import { Repository } from 'typeorm';
import { Payment } from '../../entity/Payment';
import { AppDataSource } from '../../data-source';
import { Invoice } from '../../entity/Invoice';
import { PaymentStatus } from '../../type/paymentStatus';
import { Token } from '../../type/token';
import { CreateInvoiceType } from '../invoice/schema';
import { CreatePaymentType } from './schema';
import { InvoiceHandler } from '../invoice/handler';

export class PaymentHandler {
    private repo: Repository<Payment>;
    private invoiceRepo: InvoiceHandler;

    constructor() {
        this.repo = AppDataSource.getRepository(Payment);
        this.invoiceRepo = new InvoiceHandler();
    }

    // Get a Payment by ID
    async getPayment(id: string): Promise<Payment> {
        try {
            const payment = await this.repo.findOne({ where: { id }, relations: ['invoice'] });
            if (!payment) {
                throw new Error(`Payment with ID ${id} does not exist.`);
            }
            return payment;
        } catch (error) {
            console.error("Error while getting Payment:", error);
            throw error;
        }
    }

    // Create a new Payment
    async createPayment(createPaymentParams: CreatePaymentType): Promise<Payment> {
        try {
            const { invoiceId } = createPaymentParams;
            const invoice = await this.invoiceRepo.getInvoice(invoiceId);
            if (!invoice) {
                throw new Error(`Invoice with ID ${invoiceId} does not exist.`);
            }
            const payment = new Payment();
            payment.invoice = invoice;
            payment.status = PaymentStatus.Pending;

            return await this.repo.save(payment);
        } catch (error) {
            console.error("Error while creating Payment:", error);
            throw error;
        }
    }

    // Update a Payment Status
    async updatePaymentTxnhash(id: string, txnHash: string, paidAsset: Token): Promise<Payment | null> {
        try {
            const payment = await this.repo.findOne({ where: { id } });
            if (!payment) {
                throw new Error(`Payment with ID ${id} does not exist.`);
            }
            payment.paidAsset = paidAsset;
            payment.txnHash = txnHash;
            payment.status = PaymentStatus.Paid;
            return await this.repo.save(payment);
        } catch (error) {
            console.error("Error while updating Payment status:", error);
            throw error;
        }
    }

    // Update a Payment Status
    async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment | null> {
        try {
            const payment = await this.repo.findOne({ where: { id } });
            if (!payment) {
                throw new Error(`Payment with ID ${id} does not exist.`);
            }

            payment.status = status;
            return await this.repo.save(payment);
        } catch (error) {
            console.error("Error while updating Payment status:", error);
            throw error;
        }
    }

    // Delete a Payment by ID
    async deletePayment(id: string): Promise<void> {
        try {
            const payment = await this.repo.findOne({ where: { id } });
            if (!payment) {
                throw new Error(`Payment with ID ${id} does not exist.`);
            }

            await this.repo.remove(payment);
        } catch (error) {
            console.error("Error while deleting Payment:", error);
            throw error;
        }
    }

    // Get all Payments
    async getAllPayments(): Promise<Payment[]> {
        try {
            return await this.repo.find({ relations: ['invoice'] });
        } catch (error) {
            console.error("Error while getting all Payments:", error);
            throw error;
        }
    }
}