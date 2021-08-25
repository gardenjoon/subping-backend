import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Payment } from "./Payment";
import { SubscribeItem } from "./SubscribeItem";
import { User } from "./User";

@Entity()
export class Subscribe {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.subscribes, 
        { cascade: true })
    user: string;

    @OneToMany(type => SubscribeItem, subscribeItem => subscribeItem.subscribe, 
        { cascade: true })
    subscribeItems: SubscribeItem[];

    @Column({ type: "date", nullable: false })
    subscribeDate: Date;

    @Column({ type: "date", nullable: true })
    expiredDate: Date;

    @Column({ type: "date", nullable: true})
    reSubscribeDate: Date;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => Payment, payment => payment.subscribe)
    payments: Payment[];
}