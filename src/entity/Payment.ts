// src/entity/Payment.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Invoice } from './Invoice';
import { Token } from '../type/token';
import { PaymentStatus } from '../type/paymentStatus';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column("text")
    txnHash!: string;

    @Column("json")
    paidAsset!: Token;

    @OneToOne(() => Invoice, invoice => invoice.payment)
    invoice!: Invoice;

    @Column({
        type: 'text',
        enum: PaymentStatus,
        default: PaymentStatus.Pending,
    })
    status!: PaymentStatus;
}