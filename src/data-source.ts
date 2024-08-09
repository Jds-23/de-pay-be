// src/data-source.ts
import { DataSource } from 'typeorm';
import { Merchant } from './entity/Merchant';
import { Offering } from './entity/Offering';
import { Payment } from './entity/Payment';
import { Invoice } from './entity/Invoice';
import { Customer } from './entity/Customer';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: process.env.DB_URL || 'database.sqlite',
    entities: [Merchant, Offering, Invoice, Customer, Payment],
    synchronize: true,
    logging: false,
});