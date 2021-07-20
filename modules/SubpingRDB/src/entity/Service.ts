import {Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from "typeorm";
import { UserAddress } from "./UserAddress";
import { Alarm } from "./Alarm";
import { Seller } from "./Seller";
import { ServiceCategory } from "./ServiceCategory";

type ServiceType = "delivery" | "online"

@Entity()
export class Service {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Seller, seller => seller.email, {
        nullable: false,
        cascade: true
    })
    @JoinColumn({name: "sellerEmail"})
    sellerEmail: string;

    @Column({
        nullable: false
    })
    name: string;

    @Column({
        nullable: false
    })
    type: ServiceType;

    @Column({
        length: 1000,
        nullable: false
    })
    serviceLogoUrl: string;

    @Column({
        type: "text"
    })
    summary: string;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date
    
    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date

    @OneToMany(type => ServiceCategory, serviceCategory => serviceCategory.categoryName)
    serviceCategories: ServiceCategory[]
}
