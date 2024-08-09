// src/__tests__/MerchantHandler.test.ts
import { Repository } from 'typeorm';
import { Merchant } from '../../entity/Merchant';
import { MerchantHandler } from './handler';
import { CreateMerchantType } from './schema';
import { mock } from 'jest-mock-extended';

describe('MerchantHandler', () => {
    let mockRepo: jest.Mocked<Repository<Merchant>>;
    let handler: MerchantHandler;

    beforeEach(() => {
        mockRepo = mock<Repository<Merchant>>();
        handler = new MerchantHandler();
        (handler as any).repo = mockRepo; // Inject the mock repository
    });

    it('should create a new merchant', async () => {
        const createMerchantParams: CreateMerchantType = {
            id: 'merchant1',
            walletAddress: '0x123',
            baseToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            metadata: { name: 'Merchant 1', description: 'A merchant' },
        };

        mockRepo.findOne.mockResolvedValueOnce(null);
        mockRepo.save.mockResolvedValueOnce({ ...createMerchantParams, offerings: [] } as Merchant);

        const result = await handler.createMerchant(createMerchantParams);

        expect(result).toMatchObject(createMerchantParams);
        expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 'merchant1' } });
        expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining(createMerchantParams));
    });

    it('should not create a merchant if it already exists', async () => {
        const existingMerchant: Merchant = {
            id: 'merchant1',
            walletAddress: '0x123',
            baseToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            metadata: { name: 'Merchant 1', description: 'A merchant' },
            offerings: [],
        };

        mockRepo.findOne.mockResolvedValueOnce(existingMerchant);

        const createMerchantParams: CreateMerchantType = {
            id: 'merchant1',
            walletAddress: '0x123',
            baseToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            metadata: { name: 'Merchant 1', description: 'A merchant' },
        };

        await expect(handler.createMerchant(createMerchantParams)).rejects.toThrow(
            `Merchant with ID ${createMerchantParams.id} already exists.`
        );
    });

    it('should get a merchant by id', async () => {
        const merchant: Merchant = {
            id: 'merchant1',
            walletAddress: '0x123',
            baseToken: { symbol: 'ETH', decimals: 18, address: '0x1234', chainId: "137", receiverWallet: "0x123" },
            metadata: { name: 'Merchant 1', description: 'A merchant' },
            offerings: [],
        };

        mockRepo.findOne.mockResolvedValueOnce(merchant);

        const result = await handler.getMerchant('merchant1');

        expect(result).toMatchObject(merchant);
        expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 'merchant1' }, relations: ['offerings'] });
    });

    it('should throw an error if merchant not found', async () => {
        mockRepo.findOne.mockResolvedValueOnce(null);

        await expect(handler.getMerchant('merchant1')).rejects.toThrow(`Merchant with ID merchant1 does not exist.`);
    });
});