import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

type AlarmType = "delivery" | "payment" | "expiration" | "info" | "important";
 
@Entity()
export class Alarm {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.alarms, 
        { nullable: false, cascade: true })
    user: string;

    @Column({ nullable: false })
    type: AlarmType;

    @Column({ nullable: false })
    title: string;

    @Column({ type: "text", nullable: false })
    content: string;

    @Column({ nullable: false, default: false })
    read: boolean;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}