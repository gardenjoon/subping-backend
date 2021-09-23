import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany } from "typeorm";
import { Service } from "./Service";

@Entity()
export class Seller {
    @PrimaryColumn({ length: 100 })
    id: string

    @Column({ length: 100 })
    email: string;

    @Column({ nullable: false })
    name: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;
    
    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => Service, service => service.seller, 
        { cascade: true })
    services: Service[];
}