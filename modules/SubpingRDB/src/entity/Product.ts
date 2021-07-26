import {Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import { Category } from "./Category";
import { Review } from "./Review";
import { Service } from "./Service";

@Entity()
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Service, service => service.products, {
        cascade: true
    })
    service: string;

    @Column({
        nullable: false
    })
    price: Number;

    @Column({
        nullable: false
    })
    name: string;

    @Column({
        type: "text",
        nullable: true
    })
    summary: string;

    @Column({
        length: 1000,
        nullable: true
    })
    productLogoUrl: string;

    @Column({
        nullable: false,
    })
    available: boolean

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date;

    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date;

    @OneToMany(type => Review, review => review.product)
    reviews: Review[]
}