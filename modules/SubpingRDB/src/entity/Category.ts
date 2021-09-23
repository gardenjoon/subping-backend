import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany } from "typeorm";
import { ServiceCategory } from "./ServiceCategory";

@Entity()
export class Category {
    @PrimaryColumn({ length: 100 })
    name: string;

    @Column({ nullable: false })
    summary: string;

    @Column({ length: 1000, nullable: true })
    categoryLogoUrl: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => ServiceCategory, serviceCategory => serviceCategory.category, 
        { cascade: true })
    serviceCategories: ServiceCategory[]
}
