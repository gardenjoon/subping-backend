import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Service } from "./Service";
import { SubscribeItem } from "./SubscribeItem";

@Entity()
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Service, service => service.products, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE" })
    service: string;

    @Column({ nullable: false })
    price: number;

    @Column({ nullable: false })
    name: string;

    @Column({ type: "text", nullable: true })
    summary: string;

    @Column({ length: 1000, nullable: true })
    productLogoUrl: string;

    @Column({ nullable: false })
    available: boolean;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => SubscribeItem, subscribeItem => subscribeItem.product, 
        { cascade: true })
    subscribeItems: SubscribeItem[];
}