import { Entity, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Seller } from "./Seller";
import { ServiceCategory } from "./ServiceCategory";
import { Product } from "./Product";
import { ServiceEvent } from "./ServiceEvent";
import { ServiceRank } from "./ServiceRank";
import { ServiceTag } from "./ServiceTag";
import { UserLike } from "./UserLike";
import { Review } from "./Review";
import { ServicePeriod } from "./ServicePeriod";

type ServiceType = "delivery" | "online"

@Entity()
export class Service {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Seller, seller => seller.services, 
        { nullable: false, onDelete: "CASCADE", onUpdate:  "CASCADE" })
    seller: Seller;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    type: ServiceType;

    @Column({ length: 1000, nullable: false })
    serviceLogoUrl: string;

    @Column({ length: 1000, nullable: true })
    serviceExplaneUrl: string;

    @Column({ type: "text" })
    summary: string;

    @Column({ nullable: false })
    customizable : boolean;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;
    
    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => ServiceCategory, serviceCategory => serviceCategory.service, 
        { cascade: true })
    serviceCategories: ServiceCategory[];

    @OneToMany(type => Product, product => product.service, 
        { cascade: true })
    products: Product[];

    @OneToMany(type => ServiceEvent, serviceEvent => serviceEvent.service, 
        { cascade: true })
    serviceEvents: ServiceEvent[];

    @OneToMany(type => ServiceRank, serviceRank => serviceRank.service, 
        { cascade: true })
    serviceRanks: ServiceRank[];

    @OneToMany(type => ServiceTag, serviceTag => serviceTag.service, 
        { cascade: true })
    serviceTags: ServiceTag[];

    @OneToMany(type => UserLike, userLike => userLike.service, 
        { cascade: true })
    userLikes: UserLike[];

    @OneToMany(type => Review, review => review.service, 
        { cascade: true })
    reviews: Review[];

    @OneToMany(type => ServicePeriod, servicePeriod => servicePeriod.service, 
        { cascade: true })
    periods: ServicePeriod[];
}