import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany } from "typeorm";
import { UserAddress } from "./UserAddress";
import { Alarm } from "./Alarm";
import { Review } from "./Review";
import { Subscribe } from "./Subscribe";
import { UserLike } from "./UserLike";
import { UserCard } from "./UserCard";

type GenterType = "F" | "M";

@Entity()
export class User {
    @PrimaryColumn({ length: 100 })
    id: string;

    @Column({ length: 100 })
    email: string;

    @Column ({ nullable: false })
    name: string;

    @Column ({ unique: true, length: 100, nullable: true })
    nickName: string;

    @Column({ nullable: true, length: 1000 })
    userProfileImageUrl: string;

    @Column({ type: "date", nullable: false })
    birthday: Date;

    @Column({ nullable: false })
    gender: GenterType;

    @Column({ length: 1000, nullable: false })
    ci: string;

    @Column({ nullable: false })
    carrier: string;
    
    @Column({ nullable: false })
    phoneNumber: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;
    
    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => Alarm, alarm => alarm.user, 
        { cascade: true })
    alarms: Alarm[];

    @OneToMany(type => UserAddress, userAddress => userAddress.user, 
        { cascade: true })
    addresses: UserAddress[];

    @OneToMany(type => Review, review => review.user, 
        { cascade: true })
    reviews: Review[];

    @OneToMany(type => Subscribe, userSubscribe => userSubscribe.user, 
        { cascade: true })
    subscribes: Subscribe[];
    
    @OneToMany(type => UserLike, userLike => userLike.user, 
        { cascade: true })
    userLikes: UserLike[];

    @OneToMany(type => UserCard, userCard => userCard.user, 
        { cascade: true })
    userCards: UserCard[];
}