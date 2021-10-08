import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Review } from "./Review";

@Entity()
export class ReviewImage {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Review, review => review.images, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE" })
    review: Review;

    @Column({ length: 1000, nullable: false})
    imageUrl: string;

    @Column({ nullable: false })
    imageIndex: number;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}