import {Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn} from "typeorm";
import { Category } from "./Category";
import { Service } from "./Service";

@Entity()
export class ServiceCategory {
    @PrimaryColumn()
    @ManyToOne(type => Service, service => service.id, {
        cascade: true
    })
    @JoinColumn({
        name: "serviceId"
    })
    serviceId: string;

    @PrimaryColumn()
    @ManyToOne(type => Category, category => category.name, {
        cascade: true
    })
    @JoinColumn({
        name: "categoryName"
    })
    categoryName: string;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date;

    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date;
}
