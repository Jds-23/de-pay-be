import { Repository } from 'typeorm';
import { Payment } from '../../entity/Payment';
import { PaymentHandler } from './handler';
import { PaymentStatus } from '../../type/paymentStatus';
import { Invoice } from '../../entity/Invoice';
import { mock } from 'jest-mock-extended';
import { Token } from '../../type/token';
import { Customer } from '../../entity/Customer';
import { Offering } from '../../entity/Offering';
import { Merchant } from '../../entity/Merchant';

const token: Token = { symbol: 'ETH', decimals: 18, address: '0x12345', chainId: "137", receiverWallet: '0x12345' };
jest.mock('../offering/handler');
jest.mock('../merchant/handler');
jest.mock('../customer/handler');
jest.mock('../invoice/handler');
describe('PaymentHandler', () => {
    let mockRepo: jest.Mocked<Repository<Payment>>;
    let handler: PaymentHandler;
    let mockInvoiceRepo: jest.Mocked<Repository<Invoice>>;

    beforeEach(() => {
        mockRepo = mock<Repository<Payment>>();
        mockInvoiceRepo = mock<Repository<Invoice>>();
        handler = new PaymentHandler();
        (handler as any).repo = mockRepo; // Inject the mock repository
    });

    it('should create a new payment', async () => {
        const merchant: Merchant = {
            id: 'merchant1',
            walletAddress: '0x123',
            baseToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            metadata: { name: 'Merchant 1', description: 'A merchant' },
            offerings: [],
        };
        const offering = {
            id: 1,
            metadata: {
                name: "Offering 1",
            },
            price: BigInt(1000),
            customToken: {
                address: "0x123",
                chainId: "137",
                decimals: 18,
                receiverWallet: "0x123",
                symbol: "ETH"
            },
            stock: 10,
            isUnlimited: false,
            isLive: true,
            merchant,
            invoices: []
        } as Offering;

        const customer = {
            id: 'customer1',
            metadata: {
                name: "Customer 1",
            },
            walletAddress: '0x123',
            invoices: [],
            email: null
        } as Customer;
        const invoice = { id: 1, customer, offering, date: new Date(), paid: false, } as Invoice;
        const createPaymentParams = { invoiceId: invoice.id };

        mockInvoiceRepo.findOne.mockResolvedValueOnce(invoice);
        mockRepo.save.mockResolvedValueOnce({
            id: 1,
            invoice,
            status: PaymentStatus.Pending,

        } as any);

        const result = await handler.createPayment(createPaymentParams);

        expect(result).toMatchObject({
            id: 1,
            invoice,
            status: PaymentStatus.Pending,
        });
        // expect(mockInvoiceRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        // expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ invoice }));
    });

    it('should throw an error if invoice does not exist', async () => {
        const createPaymentParams = { invoiceId: 1 };

        mockInvoiceRepo.findOne.mockResolvedValueOnce(null);

        await expect(handler.createPayment(createPaymentParams)).rejects.toThrow(
            `Invoice with ID ${createPaymentParams.invoiceId} does not exist.`
        );
    });

    it('should update a payment txnHash and status', async () => {
        const merchant: Merchant = {
            id: 'merchant1',
            walletAddress: '0x123',
            baseToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            metadata: { name: 'Merchant 1', description: 'A merchant' },
            offerings: [],
        };
        const offering = {
            id: 1,
            metadata: {
                name: "Offering 1",
            },
            price: BigInt(1000),
            customToken: {
                address: "0x123",
                chainId: "137",
                decimals: 18,
                receiverWallet: "0x123",
                symbol: "ETH"
            },
            stock: 10,
            isUnlimited: false,
            isLive: true,
            merchant,
            invoices: []
        } as Offering;

        const customer = {
            id: 'customer1',
            metadata: {
                name: "Customer 1",
            },
            walletAddress: '0x123',
            invoices: [],
            email: null
        } as Customer;
        const invoice = { id: 1, customer, offering, date: new Date(), paid: false } as Invoice;

        const payment = {
            id: 'payment1',
            invoice,
            txnHash: '',
            paidAsset: {},
            status: PaymentStatus.Pending,
        } as Payment;
        const txnHash = '0x12345';
        const paidAsset: Token = token;

        mockRepo.findOne.mockResolvedValueOnce(payment);
        mockRepo.save.mockResolvedValueOnce({
            ...payment,
            txnHash,
            paidAsset,
            status: PaymentStatus.Paid,
        });

        const result = await handler.updatePaymentTxnhash('payment1', txnHash, paidAsset);

        expect(result).toMatchObject({
            txnHash: '0x12345',
            paidAsset: { symbol: 'ETH' },
            status: PaymentStatus.Paid,
        });
        expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ txnHash: '0x12345', status: PaymentStatus.Paid }));
    });

    it('should throw an error if payment does not exist when updating txnHash', async () => {
        mockRepo.findOne.mockResolvedValueOnce(null);

        await expect(handler.updatePaymentTxnhash('payment1', '0x12345', token)).rejects.toThrow(
            `Payment with ID payment1 does not exist.`
        );
    });

    it('should update the payment status', async () => {
        const payment = {
            id: 'payment1',
            status: PaymentStatus.Pending,
        } as Payment;

        mockRepo.findOne.mockResolvedValueOnce(payment);
        mockRepo.save.mockResolvedValueOnce({
            ...payment,
            status: PaymentStatus.Paid,
        });

        const result = await handler.updatePaymentStatus('payment1', PaymentStatus.Paid);

        expect(result).toMatchObject({ status: PaymentStatus.Paid });
        expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: PaymentStatus.Paid }));
    });

    it('should throw an error if payment does not exist when updating status', async () => {
        mockRepo.findOne.mockResolvedValueOnce(null);

        await expect(handler.updatePaymentStatus('payment1', PaymentStatus.Paid)).rejects.toThrow(
            `Payment with ID payment1 does not exist.`
        );
    });

    it('should get a payment by ID', async () => {
        const merchant: Merchant = {
            id: 'merchant1',
            walletAddress: '0x123',
            baseToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            metadata: { name: 'Merchant 1', description: 'A merchant' },
            offerings: [],
        };
        const offering = {
            id: 1,
            metadata: {
                name: "Offering 1",
            },
            price: BigInt(1000),
            customToken: {
                address: "0x123",
                chainId: "137",
                decimals: 18,
                receiverWallet: "0x123",
                symbol: "ETH"
            },
            stock: 10,
            isUnlimited: false,
            isLive: true,
            merchant,
            invoices: []
        } as Offering;

        const customer = {
            id: 'customer1',
            metadata: {
                name: "Customer 1",
            },
            walletAddress: '0x123',
            invoices: [],
            email: null
        } as Customer;
        const invoice = { id: 1, customer, offering, date: new Date(), paid: false } as Invoice;

        const payment = {
            id: 'payment1',
            invoice,
            status: PaymentStatus.Pending,
        } as Payment;

        mockRepo.findOne.mockResolvedValueOnce(payment);

        const result = await handler.getPayment('payment1');

        expect(result).toMatchObject(payment);
        expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 'payment1' }, relations: ['invoice'] });
    });

    it('should throw an error if payment does not exist when getting by ID', async () => {
        mockRepo.findOne.mockResolvedValueOnce(null);

        await expect(handler.getPayment('payment1')).rejects.toThrow(`Payment with ID payment1 does not exist.`);
    });

    // it('should delete a payment by ID', async () => {
    //     const payment = { id: 'payment1' } as Payment;

    //     mockRepo.findOne.mockResolvedValueOnce(payment);
    //     mockRepo.remove.mockResolvedValueOnce(undefined);

    //     await handler.deletePayment('payment1');

    //     expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 'payment1' } });
    //     expect(mockRepo.remove).toHaveBeenCalledWith(payment);
    // });

    // it('should throw an error if payment does not exist when deleting', async () => {
    //     mockRepo.findOne.mockResolvedValueOnce(null);

    //     await expect(handler.deletePayment('payment1')).rejects.toThrow(`Payment with ID payment1 does not exist.`);
    // });

    it('should get all payments', async () => {
        const merchant: Merchant = {
            id: 'merchant1',
            walletAddress: '0x123',
            baseToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            metadata: { name: 'Merchant 1', description: 'A merchant' },
            offerings: [],
        };
        const offering = {
            id: 1,
            metadata: {
                name: "Offering 1",
            },
            price: BigInt(1000),
            customToken: {
                address: "0x123",
                chainId: "137",
                decimals: 18,
                receiverWallet: "0x123",
                symbol: "ETH"
            },
            stock: 10,
            isUnlimited: false,
            isLive: true,
            merchant,
            invoices: []
        } as Offering;

        const customer = {
            id: 'customer1',
            metadata: {
                name: "Customer 1",
            },
            walletAddress: '0x123',
            invoices: [],
            email: null
        } as Customer;
        const invoice1 = { id: 1, customer, offering, date: new Date(), paid: false } as Invoice;
        const invoice2 = { id: 2, customer, offering, date: new Date(), paid: false } as Invoice;

        const payments = [
            { id: 'payment1', status: PaymentStatus.Pending, invoice: invoice1 },
            { id: 'payment2', status: PaymentStatus.Paid, invoice: invoice1 },
        ] as Payment[];

        mockRepo.find.mockResolvedValueOnce(payments);

        const result = await handler.getAllPayments();

        expect(result).toMatchObject(payments);
        expect(mockRepo.find).toHaveBeenCalledWith({ relations: ['invoice'] });
    });
});