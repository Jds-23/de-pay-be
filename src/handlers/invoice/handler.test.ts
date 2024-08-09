import { Repository } from 'typeorm';
import { Invoice } from '../../entity/Invoice';
import { InvoiceHandler } from './handler';
import { Customer } from '../../entity/Customer';
import { Offering } from '../../entity/Offering';
import { Payment } from '../../entity/Payment';
import { OfferingHandler } from '../offering/handler';
import { MerchantHandler } from '../merchant/handler';
import { CustomerHandler } from '../customer/handler';
import { mock } from 'jest-mock-extended';
import { CreateInvoiceType } from './schema';
import { Merchant } from '../../entity/Merchant';

jest.mock('../offering/handler');
jest.mock('../merchant/handler');
jest.mock('../customer/handler');

describe('InvoiceHandler - createInvoice and getInvoice', () => {
    let mockRepo: jest.Mocked<Repository<Invoice>>;
    let handler: InvoiceHandler;
    let mockOfferingHandler: jest.Mocked<OfferingHandler>;
    let mockCustomerHandler: jest.Mocked<CustomerHandler>;

    beforeEach(() => {
        mockRepo = mock<Repository<Invoice>>();
        mockOfferingHandler = new OfferingHandler() as jest.Mocked<OfferingHandler>;
        mockCustomerHandler = new CustomerHandler() as jest.Mocked<CustomerHandler>;
        handler = new InvoiceHandler();
        (handler as any).repo = mockRepo; // Inject the mock repository
        (handler as any).offeringHandler = mockOfferingHandler; // Inject the mock OfferingHandler
        (handler as any).customerHandler = mockCustomerHandler; // Inject the mock CustomerHandler
    });

    it('should create an invoice with an existing offering and customer', async () => {
        const createInvoiceParams: CreateInvoiceType = {
            offeringId: 1,
            customerId: 'customer1',
            date: (new Date()).toISOString(),
        };
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

        mockOfferingHandler.getOffering.mockResolvedValueOnce(offering);
        mockCustomerHandler.getCustomer.mockResolvedValueOnce(customer);
        mockRepo.save.mockResolvedValueOnce({ id: 1, customer, offering, date: new Date(), paid: false } as Invoice);

        const result = await handler.createInvoice(createInvoiceParams);

        expect(result).toMatchObject({
            customer: { id: 'customer1' },
            offering: { id: 1 },
            paid: false,
        });
        expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ offering, customer }));
    });

    it('should create an invoice with a new offering and customer', async () => {
        const createInvoiceParams: CreateInvoiceType = {
            offering: {
                merchantId: 'merchant1',
                metadata: { name: 'Offering 1', description: 'An offering' },
                price: '1000',
                stock: 10,
                isUnlimited: false,
            },
            customer: {
                id: 'customer1',
                walletAddress: '0x123',
            },
            date: (new Date()).toISOString(),
        };

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

        mockOfferingHandler.createOffering.mockResolvedValueOnce(offering);
        mockCustomerHandler.createCustomer.mockResolvedValueOnce(customer);
        mockRepo.save.mockResolvedValueOnce({ id: 1, customer, offering, date: new Date(), paid: false } as Invoice);

        const result = await handler.createInvoice(createInvoiceParams);

        expect(result).toMatchObject({
            customer: { id: 'customer1' },
            offering: { id: 1 },
            paid: false,
        });
        expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ offering, customer }));
    });

    // it('should throw an error if offering does not exist', async () => {
    //     const createInvoiceParams: CreateInvoiceType = {
    //         offeringId: 1,
    //         customerId: 'customer1',
    //         date: (new Date()).toISOString(),
    //     };

    //     mockOfferingHandler.getOffering.mockRejectedValueOnce(new Error(`Offering with ID 1 does not exist.`));;

    //     await expect(handler.createInvoice(createInvoiceParams)).rejects.toThrow(`Offering with ID 1 does not exist.`);
    // });

    it('should throw an error if customer does not exist', async () => {
        const createInvoiceParams: CreateInvoiceType = {
            offeringId: 1,
            customerId: 'customer1',
            date: (new Date()).toISOString(),
        };

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


        mockOfferingHandler.getOffering.mockResolvedValueOnce(offering);
        mockCustomerHandler.getCustomer.mockResolvedValueOnce(null);

        await expect(handler.createInvoice(createInvoiceParams)).rejects.toThrow(`Customer with ID customer1 does not exist.`);
    });

    it('should get an invoice by id', async () => {
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
        } as Customer; const invoice = { id: 1, customer, offering, date: new Date(), paid: false } as Invoice;

        mockRepo.findOne.mockResolvedValueOnce(invoice);

        const result = await handler.getInvoice(1);

        expect(result).toMatchObject(invoice);
        expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['customer', 'offering', 'payment'] });
    });

    it('should throw an error if invoice not found', async () => {
        mockRepo.findOne.mockResolvedValueOnce(null);

        await expect(handler.getInvoice(1)).rejects.toThrow(`Invoice with ID 1 does not exist.`);
    });
});