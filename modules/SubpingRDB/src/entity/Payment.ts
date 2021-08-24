import { Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, Column } from "typeorm";
import { Subscribe } from "./Subscribe";

@Entity()
export class Payment {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Subscribe, subscribe => subscribe.payments, 
        { cascade: true })
    subscribe: string;

    @Column({ type: "date", nullable: false })
    paymentDate: Date;

    @Column({ nullable: false, default: false })
    paymentComplete: Boolean;

    @Column({ nullable: false, default: false })
    rewardComplete: Boolean;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}