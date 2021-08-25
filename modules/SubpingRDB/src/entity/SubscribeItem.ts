import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";
import { Subscribe } from "./Subscribe";

type Period = "1W" | "2W" | "3W" | "1M" | "2M" | "3M";

@Entity()
export class SubscribeItem {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Subscribe, subscribe => subscribe.subscribeItems, 
        { cascade: true })
    subscribe: string;

    @ManyToOne(type => Product, product => product.subscribeItems, 
        { cascade: true })
    product: string;

    @Column({ length: 50, nullable: false })
    period: Period;

    @Column({ nullable: false })
    amount: number;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}