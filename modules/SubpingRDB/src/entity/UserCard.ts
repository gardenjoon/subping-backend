import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class UserCard {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.userCards, { nullable: false, cascade: true })
    user: string;
    
    @Column({ nullable: false })
    cardVendor: string;

    @Column({ nullable: false })
    cardNumber: string;

    @Column({ nullable: false })
    billingKey: string

    @Column({ nullable: false })
    pg: string;

    @Column({ nullable: false })
    method: string;

    @Column({ nullable: false })
    expiredAt: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}