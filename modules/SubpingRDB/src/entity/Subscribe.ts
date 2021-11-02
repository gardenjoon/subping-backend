import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany, RelationId } from "typeorm";
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

    @RelationId((subscribe: Subscribe) => subscribe.user)
    userId: string;

    @ManyToOne(type => UserCard, userCard => userCard.subscribes,
        { nullable: false })
    userCard: UserCard;
    
    @RelationId((subscribe: Subscribe) => subscribe.userCard)
    userCardId: string;

    @ManyToOne(type => UserAddress, userAddress => userAddress.subscribes, 
        { nullable: false })
    address: UserAddress;

    @RelationId((subscribe: Subscribe) => subscribe.address)
    addressId: string;

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

    @Column({ length: 100, nullable: true })
    deliveryMemo: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => Payment, payment => payment.subscribe, 
        { cascade: true })
    payments: Payment[];
}