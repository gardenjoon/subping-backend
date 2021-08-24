import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Review } from "./Review";

@Entity()
export class ReviewImage {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Review, review => review.images, 
        { cascade: true })
    review: string;

    @Column({ length: 1000, nullable: false})
    imageUrl: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}