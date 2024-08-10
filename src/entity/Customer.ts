import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn } from "typeorm";
import { Invoice } from "./Invoice";
import { Metadata } from "../type/profile";

@Entity()
export class Customer {
    @PrimaryColumn("text")
    id!: string;

    @Column("json", { nullable: true })
    metadata!: Metadata | null;

    @OneToMany(type => Invoice, invoice => invoice.customer)
    invoices!: Invoice[];

    @Column("text")
    walletAddress!: string;

    @Column("text", { nullable: true })
    email!: string | null;
}