import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Service } from "./Service";
import { ReviewImage } from "./ReviewImage";
import { User } from "./User";

@Entity()
export class Review {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.reviews, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE" })
    user: User;

    @ManyToOne(type => Service, service => service.reviews, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE" })
    service: string;

    @Column({ type: "text", nullable: true })
    content: string;

    @Column({ nullable: false })
    rating: number;
    
    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => ReviewImage, reviewImage => reviewImage.review, 
        { cascade: true })
    images: ReviewImage[];
}
