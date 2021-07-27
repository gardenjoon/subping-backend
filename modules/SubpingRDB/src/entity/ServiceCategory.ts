import {Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import { Category } from "./Category";
import { Service } from "./Service";

@Entity()
export class ServiceCategory {
    @ManyToOne(type => Service, service => service.serviceCategories, {
        cascade: true,
        primary: true
    })
    service: string;

    @ManyToOne(type => Category, category => category.serviceCategories, {
        cascade: true,
        primary: true
    })
    category: string;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date;

    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date;
}
