import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { Customer } from "./Customer";
import { Offering } from "./Offering";
import { Payment } from "./Payment";

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(type => Customer, customer => customer.invoices, {
        nullable: true, // The customer can be initially null
    })
    customer!: Customer | null;

    @ManyToOne(type => Offering, offering => offering.invoices)
    offering!: Offering;

    @OneToOne(() => Payment, payment => payment.invoice, {
        cascade: true,
        nullable: true, // The payment can be initially null
    })
    @JoinColumn()
    payment!: Payment | null;

    @Column("date")
    date!: Date;

    @Column("boolean")
    paid!: boolean;
}