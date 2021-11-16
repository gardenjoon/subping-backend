import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany, RelationId } from "typeorm";
import { RewardItem } from "./RewardItem";
import { Service } from "./Service";
import { SubscribeItem } from "./SubscribeItem";

@Entity()
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Service, service => service.products, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE" })
    service: Service;

    @RelationId((product: Product) => product.service)
    serviceId: string;

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

    @OneToMany(type => RewardItem, rewardItem => rewardItem.product, 
        { cascade: true })
    rewardItems: RewardItem[];
}