import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Merchant } from "./Merchant";
import { Invoice } from "./Invoice";
import { Metadata } from "../type/profile";
import { Token } from "../type/token";

@Entity()
export class Offering {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("json")
    metadata!: Metadata;

    @Column("text")
    price!: string;

    @Column("json")
    customToken!: Token;

    @Column("integer")
    stock!: number;

    @Column("boolean")
    isUnlimited!: boolean;

    @Column("boolean")
    isLive!: boolean;

    @ManyToOne(type => Merchant, merchant => merchant.offerings)
    merchant!: Merchant;

    @OneToMany(type => Invoice, invoice => invoice.offering)
    invoices!: Invoice[];
}