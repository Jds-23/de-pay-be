// src/entity/Merchant.ts
import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Offering } from './Offering';

@Entity()
export class Merchant {
    @PrimaryColumn("text")
    id!: string;

    @Column("text")
    name!: string;

    @Column("text", { default: "" })
    description!: string;

    @Column("text")
    address!: string;

    @Column("text", { nullable: true })
    imageUrl: string | null = null;

    @OneToMany(type => Offering, offering => offering.merchant)
    offerings!: Offering[];
}

