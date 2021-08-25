import { Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Service } from "./Service";

@Entity()
export class ServiceTag {
    @ManyToOne(type => Service, service => service.serviceTags,
        { cascade: true, primary: true })
    service: string;

    @PrimaryColumn({ length: 100 })
    tag: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}