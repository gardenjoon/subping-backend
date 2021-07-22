import {Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn, OneToMany} from "typeorm";
import { ServiceCategory } from "./ServiceCategory";

@Entity()
export class Category {
    @PrimaryColumn()
    name: string;

    @Column({
        nullable: false
    })
    summary: string;

    @Column({
        nullable: true,
        length: 1000
    })
    categoryLogoUrl: string;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date;

    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date;

    @OneToMany(type => ServiceCategory, serviceCategory => serviceCategory.category)
    serviceCategories: ServiceCategory[]
}
