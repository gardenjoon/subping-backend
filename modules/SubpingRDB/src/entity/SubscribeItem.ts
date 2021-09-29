import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";
import { Subscribe } from "./Subscribe";

@Entity()
export class SubscribeItem {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Subscribe, subscribe => subscribe.subscribeItems, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE" })
    subscribe: Subscribe;

    @ManyToOne(type => Product, product => product.subscribeItems, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE" })
    product: Product;

    @Column({ nullable: false })
    amount: number;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}