import {Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import { Product } from "./Product";
import { ReviewImage } from "./ReviewImage";
import { User } from "./User";

@Entity()
export class Review {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @PrimaryColumn()
    @ManyToOne(type => User, user => user.email, {
        cascade: true
    })
    @JoinColumn({
        name: "userEmail"
    })
    userEmail: string;

    @PrimaryColumn()
    @ManyToOne(type => Product, product => product.id, {
        cascade: true
    })
    @JoinColumn({
        name: "productId"
    })
    productId: string;

    @Column({
        nullable: false
    })
    title: string;

    @Column({
        type: "text",
        nullable: false
    })
    content: string;

    @Column({
        nullable: false
    })
    rating: Number;
    
    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date;

    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date;

    @OneToMany(type => ReviewImage, reviewImage => reviewImage.id)
    images: ReviewImage[]
}
