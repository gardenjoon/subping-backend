import {Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import { Review } from "./Review";

@Entity()
export class ReviewImage {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Review, review => review.id, {
        cascade: true
    })
    @JoinColumn({
        name: "reviewId"
    })
    reviewId: string;

    @Column({
        length: 1000,
        nullable: false
    }) 
    imageUrl: string;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date;

    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date;
}
