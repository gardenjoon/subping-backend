import { Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, Column } from "typeorm";
import { Subscribe } from "./Subscribe";

@Entity()
export class Payment {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: true })
    iamportUid: string;

    @ManyToOne(type => Subscribe, subscribe => subscribe.payments, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE" })
    subscribe: Subscribe;

    @Column({ nullable: false })
    amount: number;
    
    @Column({ type: "date", nullable: false })
    paymentDate: Date;

    @Column({ nullable: false, default: false })
    paymentComplete: Boolean;

    @Column({ nullable: false, default: false })
    rewardComplete: Boolean;

    @Column({ nullable: false, default: false })
    paymentFailure: Boolean;
    
    @Column({ type: "text", nullable: true })
    failureReason: String;
    
    @Column({ type: "text", nullable: true })
    paidCardVendor: String;
    
    @Column({ type: "text", nullable: true })
    paidCardNumber: String;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}