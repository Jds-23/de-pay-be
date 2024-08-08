// import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
// import { Invoice } from "./Invoice";

// @Entity()
// export class Customer {
//     @PrimaryGeneratedColumn()
//     id!: number;

//     @Column()
//     name!: string;

//     @OneToMany(type => Invoice, invoice => invoice.customer)
//     invoices!: Invoice[];
// }