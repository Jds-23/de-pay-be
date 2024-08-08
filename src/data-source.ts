// src/data-source.ts
import { DataSource } from 'typeorm';
import { Merchant } from './entity/Merchant';
import { Offering } from './entity/Offering';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: process.env.DB_URL || 'database.sqlite',
    entities: [Merchant, Offering],
    synchronize: true,
    logging: false,
});