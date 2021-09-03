import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class UserCard {
    @PrimaryColumn({ nullable: false })
    id: string;

    @ManyToOne(type => User, user => user.userCards,
        { nullable: false, cascade: true })
    user: string;

    @Column({ nullable: false })
    cardVendor: string;

    @Column({ nullable: false })
    cardName: string;

    @Column({ nullable: false })
    billingKey: string

    @Column({ nullable: false })
    pg: string;

    @Column({ nullable: false })
    method: string;

    @Column({ nullable: true })
    expiredAt: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}