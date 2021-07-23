import {Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany} from "typeorm";
import { UserAddress } from "./UserAddress";
import { Alarm } from "./Alarm";
import { Review } from "./Review";

type GenterType = "F" | "M";

@Entity()
export class User {
    @PrimaryColumn({
        length: 100
    })
    email: string;

    @Column({
        nullable: false
    })
    name: string;

    @Column({
        unique: true,
        nullable: true,
        length: 100
    })
    nickName: string;

    @Column({
        nullable: true,
        length: 1000
    })
    userProfileImageUrl: string;

    @Column({ 
        type: "date", 
        nullable: false 
    })
    birthday: Date;

    @Column({
        nullable: false
    })
    gender: GenterType;

    @Column({
        length: 1000,
        nullable: false
    })
    ci: string;

    @Column({
        nullable: false
    })
    carrier: string;
    
    @Column({
        nullable: false
    })
    phoneNumber: string;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date
    
    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date

    @OneToMany(type => Alarm, alarm => alarm.user)
    alarms: Alarm[];

    @OneToMany(type => UserAddress, userAddress => userAddress.user)
    addresses: UserAddress[];

    @OneToMany(type => Review, review => review.user)
    reviews: Review[];
}
