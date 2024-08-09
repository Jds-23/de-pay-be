// src/handlers/CustomerHandler.ts
import { Repository } from 'typeorm';
import { Customer } from '../../entity/Customer';
import { AppDataSource } from '../../data-source';
import { CreateCustomerType } from './schema';

export class CustomerHandler {
    private repo: Repository<Customer>;

    constructor() {
        this.repo = AppDataSource.getRepository(Customer);
    }

    // Get a Customer by ID
    async getCustomer(id: string) {
        try {
            return await this.repo.findOne({ where: { id }, relations: ['invoices'] });
        } catch (error) {
            console.error("Error while getting Customer:", error);
            throw error;
        }
    }

    // Create a new Customer
    async createCustomer(createCustomerParams: CreateCustomerType) {
        try {
            const existing = await this.repo.findOne({ where: { id: createCustomerParams.id } });
            if (!existing) {
                const customer = new Customer();
                customer.id = createCustomerParams.id;
                customer.metadata = createCustomerParams.metadata || null;
                customer.walletAddress = createCustomerParams.walletAddress;
                customer.email = createCustomerParams.email || null;
                customer.invoices = [];

                return await this.repo.save(customer);
            } else {
                throw new Error(`Customer with ID ${createCustomerParams.id} already exists.`);
            }
        } catch (error: any) {
            console.error("Error while creating Customer:", error);
            throw new Error(error?.message || 'Failed to create customer');
        }
    }

    // Update an existing Customer
    async updateCustomer(id: string, updateCustomerParams: Partial<CreateCustomerType>) {
        try {
            const customer = await this.repo.findOne({ where: { id } });
            if (customer) {
                customer.metadata = updateCustomerParams.metadata || customer.metadata;
                customer.walletAddress = updateCustomerParams.walletAddress || customer.walletAddress;
                customer.email = updateCustomerParams.email !== undefined ? updateCustomerParams.email : customer.email;

                return await this.repo.save(customer);
            } else {
                throw new Error(`Customer with ID ${id} does not exist.`);
            }
        } catch (error: any) {
            console.error("Error while updating Customer:", error);
            throw new Error(error?.message || 'Failed to update customer');
        }
    }

    // Delete a Customer by ID
    async deleteCustomer(id: string) {
        try {
            const customer = await this.repo.findOne({ where: { id } });
            if (customer) {
                return await this.repo.remove(customer);
            } else {
                throw new Error(`Customer with ID ${id} does not exist.`);
            }
        } catch (error: any) {
            console.error("Error while deleting Customer:", error);
            throw new Error(error?.message || 'Failed to delete customer');
        }
    }

    // Get all Customers
    async getAllCustomers() {
        try {
            return await this.repo.find({ relations: ['invoices'] });
        } catch (error) {
            console.error("Error while getting all Customers:", error);
            throw error;
        }
    }
}