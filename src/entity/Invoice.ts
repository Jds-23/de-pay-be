// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
// import { Customer } from "./Customer";
// import { Offering } from "./Offering";

// @Entity()
// export class Invoice {
//     @PrimaryGeneratedColumn()
//     id!: number;

//     @ManyToOne(type => Customer, customer => customer.invoices)
//     customer!: Customer;

//     @ManyToOne(type => Offering, offering => offering.invoices)
//     offering!: Offering;

//     @Column()
//     date!: Date;

//     @Column("decimal")
//     amount!: number;
// }