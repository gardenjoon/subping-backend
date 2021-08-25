import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Review } from "./Review";
import { Service } from "./Service";
import { SubscribeItem } from "./SubscribeItem";
import { ProductPeriod } from "./ProductPeriod";

@Entity()
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Service, service => service.products, 
        { cascade: true })
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

    @OneToMany(type => Review, review => review.product)
    reviews: Review[];

    @OneToMany(type => SubscribeItem, subscribeItem => subscribeItem.product)
    subscribeItems: SubscribeItem[];

    @OneToMany(type => ProductPeriod, productPeriod => productPeriod.product)
    periods: ProductPeriod[];
}