import { Entity, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { Payment } from "./Payment";
import { RewardItem } from "./RewardItem";

@Entity()
export class Reward {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(type => Payment, payment => payment.id,
        { onDelete: "CASCADE", onUpdate:  "CASCADE" })
    @JoinColumn()
    payment: Payment;

    @Column({ nullable: false })
    startDate: string;

    @Column({ nullable: false })
    endDate: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => RewardItem, rewardItem => rewardItem.reward,
        { cascade: true })
    rewardItems: RewardItem[];
}