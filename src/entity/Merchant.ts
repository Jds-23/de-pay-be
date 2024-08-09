// src/entity/Merchant.ts
import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Offering } from './Offering';
import { Token } from '../type/token';
import { Metadata } from '../type/profile';

@Entity()
export class Merchant {
    @PrimaryColumn("text")
    id!: string;

    @Column("json")
    metadata!: Metadata;

    @Column("text")
    walletAddress!: string;

    @Column("json")
    baseToken!: Token;

    @OneToMany(type => Offering, offering => offering.merchant)
    offerings!: Offering[];
}

