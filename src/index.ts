// src/index.ts
import "reflect-metadata";
import express from 'express';
import bodyParser from 'body-parser';
import merchantRoutes from './routes/merchantRoutes';
import { AppDataSource } from './data-source';
import offeringRoutes from './routes/offering';
import invoiceRoutes from './routes/invoiceRoutes';

const app = express();
app.use(bodyParser.json());


AppDataSource.initialize()
    .then(() => {
        app.use('/api', merchantRoutes);
        app.use('/api', offeringRoutes);
        app.use('/api', invoiceRoutes);

        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(error => console.error('Error during Data Source initialization', error));