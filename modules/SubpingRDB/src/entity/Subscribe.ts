import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Payment } from "./Payment";
import { SubscribeItem } from "./SubscribeItem";
import { User } from "./User";
import { UserAddress } from "./UserAddress";
import { UserCard } from "./UserCard";

type Period = "1W" | "2W" | "3W" | "1M" | "2M" | "3M";

@Entity()
export class Subscribe {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.subscribes, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE" })
    user: User;

    @ManyToOne(type => UserCard, userCard => userCard.subscribes,
        { nullable: false, onDelete: "CASCADE", onUpdate:  "CASCADE" })
    userCard: UserCard;
    
    @ManyToOne(type => UserAddress, userAddress => userAddress.subscribes, 
        { nullable: false })
    address: UserAddress;

    @OneToMany(type => SubscribeItem, subscribeItem => subscribeItem.subscribe, 
        { cascade: true })
    subscribeItems: SubscribeItem[];

    @Column({ type: "date", nullable: false })
    subscribeDate: Date;

    @Column({ type: "date", nullable: true })
    expiredDate: Date;

    @Column({ type: "date", nullable: true})
    reSubscribeDate: Date;

    @Column({ length: 50, nullable: false })
    period: Period;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => Payment, payment => payment.subscribe, 
        { cascade: true })
    payments: Payment[];
}