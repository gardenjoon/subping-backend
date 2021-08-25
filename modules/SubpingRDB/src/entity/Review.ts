import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Product } from "./Product";
import { ReviewImage } from "./ReviewImage";
import { User } from "./User";

@Entity()
export class Review {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.reviews, 
        { cascade: true })
    user: string;

    @ManyToOne(type => Product, product => product.reviews, 
        { cascade: true })
    product: string;

    @Column({ nullable: false })
    title: string;

    @Column({ type: "text", nullable: false })
    content: string;

    @Column({ nullable: false })
    rating: Number;
    
    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => ReviewImage, reviewImage => reviewImage.review)
    images: ReviewImage[];
}
