import {Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany} from "typeorm";
import { UserAddress } from "./UserAddress";
import { Alarm } from "./Alarm";
import { Service } from "./Service";

@Entity()
export class Seller {
    @PrimaryColumn()
    email: string;

    @Column({
        nullable: false
    })
    name: string;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date
    
    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date

    @OneToMany(type => Alarm, alarm => alarm.userEmail)
    alarms: Alarm[];

    @OneToMany(type => UserAddress, userAddress => userAddress.userEmail)
    addresses: UserAddress[];

    @OneToMany(type => Service, service => service.sellerEmail)
    services: Service[];
}
