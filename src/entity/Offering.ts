import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Merchant } from "./Merchant";
// import { Invoice } from "./Invoice";

@Entity()
export class Offering {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text")
    description!: string;

    @Column("decimal")
    price!: number;

    @ManyToOne(type => Merchant, merchant => merchant.offerings)
    merchant!: Merchant;

    // @OneToMany(type => Invoice, invoice => invoice.offering)
    // invoices!: Invoice[];
}