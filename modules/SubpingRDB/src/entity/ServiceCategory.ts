import { Entity, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Category } from "./Category";
import { Service } from "./Service";

@Entity()
export class ServiceCategory {
    @ManyToOne(type => Service, service => service.serviceCategories,
        { onDelete: "CASCADE", onUpdate:  "CASCADE", primary: true })
    service: string;

    @ManyToOne(type => Category, category => category.serviceCategories, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE", primary: true })
    category: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}