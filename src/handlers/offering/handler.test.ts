import { Repository } from 'typeorm';
import { Offering } from '../../entity/Offering';
import { OfferingHandler } from './handler';
import { MerchantHandler } from '../merchant/handler';
import { mock } from 'jest-mock-extended';
import { CreateOfferingType } from './schema';

jest.mock('../merchant/handler'); // Mock the MerchantHandler

describe('OfferingHandler - createOffering', () => {
    let mockRepo: jest.Mocked<Repository<Offering>>;
    let handler: OfferingHandler;
    let mockMerchantHandler: jest.Mocked<MerchantHandler>;

    beforeEach(() => {
        mockRepo = mock<Repository<Offering>>();
        mockMerchantHandler = new MerchantHandler() as jest.Mocked<MerchantHandler>;
        handler = new OfferingHandler();
        (handler as any).repo = mockRepo; // Inject the mock repository
        (handler as any).merchantHandler = mockMerchantHandler; // Inject the mock MerchantHandler
    });

    it('should create a new offering when no existing offering is found', async () => {
        const createOfferingParams: CreateOfferingType = {
            merchantId: 'merchant1',
            metadata: { name: 'Offering 1', description: 'An offering' },
            price: '1000',
            customToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            stock: 10,
            isUnlimited: false,
        };

        const merchant = {
            id: 'merchant1',
            baseToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            metadata: {},
            offerings: [],
        };

        mockMerchantHandler.getMerchant.mockResolvedValueOnce(merchant as any);
        mockRepo.findOne.mockResolvedValueOnce(null);
        mockRepo.save.mockResolvedValueOnce({ ...createOfferingParams, id: 1, merchant, invoices: [] } as any);

        const result = await handler.createOffering(createOfferingParams);

        expect(result).toMatchObject({ ...createOfferingParams, id: 1 });
        // expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: undefined } });
        expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ metadata: createOfferingParams.metadata }));
    });

    it('should throw an error if the offering already exists', async () => {
        const merchant = {
            id: 'merchant1',
            baseToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            metadata: {},
            offerings: [],
        };

        const existingOffering = {
            id: 1,
            metadata: { name: 'Existing Offering' },
            price: BigInt(1000),
            customToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            stock: 10,
            isUnlimited: false,
            isLive: true,
            merchant: merchant,
            invoices: [],
        };

        mockRepo.findOne.mockResolvedValueOnce(existingOffering as any);

        const createOfferingParams: CreateOfferingType = {
            id: 1,
            merchantId: 'merchant1',
            metadata: { name: 'Offering 1', description: 'An offering' },
            price: '1000',
            customToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            stock: 10,
            isUnlimited: false,
        };

        await expect(handler.createOffering(createOfferingParams)).rejects.toThrow(
            `Offering with ID ${existingOffering.id} already exists.`
        );
    });

    it('should throw an error if the merchant does not exist', async () => {
        mockRepo.findOne.mockResolvedValueOnce(null);
        mockMerchantHandler.getMerchant.mockRejectedValueOnce(new Error(`Merchant with ID merchant2 does not exist.`));


        const createOfferingParams: CreateOfferingType = {
            merchantId: 'merchant2',
            metadata: { name: 'Offering 1', description: 'An offering' },
            price: '1000',
            customToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            stock: 10,
            isUnlimited: false,
        };

        await expect(handler.createOffering(createOfferingParams)).rejects.toThrow(
            `Merchant with ID ${createOfferingParams.merchantId} does not exist.`
        );
    });

    it('should use the merchant baseToken if customToken is not provided', async () => {
        const createOfferingParams: CreateOfferingType = {
            merchantId: 'merchant1',
            metadata: { name: 'Offering 1', description: 'An offering' },
            price: '1000',
            stock: 10,
            isUnlimited: false,
        };

        const merchant = {
            id: 'merchant1',
            baseToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            metadata: {},
            offerings: [],
        };

        mockMerchantHandler.getMerchant.mockResolvedValueOnce(merchant as any);
        mockRepo.findOne.mockResolvedValueOnce(null);
        mockRepo.save.mockResolvedValueOnce({
            ...createOfferingParams,
            id: 1,
            merchant,
            customToken: merchant.baseToken,
            invoices: [],
        } as any);

        const result = await handler.createOffering(createOfferingParams);

        expect(result.customToken).toMatchObject(merchant.baseToken);
        expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ customToken: merchant.baseToken }));
    });
});