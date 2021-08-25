import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Review } from "./Review";
import { Service } from "./Service";
import { SubscribeItem } from "./SubscribeItem";

type Period = "1W" | "2W" | "3W" | "1M" | "2M" | "3M";

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

    @Column({ length: 50, nullable: false })
    period: Period;

    @Column({ nullable: false })
    amount: number;

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
}