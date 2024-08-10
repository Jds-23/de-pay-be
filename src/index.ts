// src/index.ts
import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import merchantRoutes from './routes/merchantRoutes';
import { AppDataSource } from './data-source';
import offeringRoutes from './routes/offering';
import invoiceRoutes from './routes/invoiceRoutes';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = 9019;

AppDataSource.initialize()
    .then(() => {
        app.use('/api/health', (req, res) => {  // Health check;
            res.status(201).send('OK');
        });
        app.use('/api', merchantRoutes);
        app.use('/api', offeringRoutes);
        app.use('/api', invoiceRoutes);

        app.listen(PORT, () => {
            console.log('Server is running on port ' + PORT);
        });
    })
    .catch(error => console.error('Error during Data Source initialization', error));