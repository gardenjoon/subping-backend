import {Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { Service } from "./Service";
import { Tag } from "./Tag";

@Entity()
export class ServiceTag {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Service, service => service.serviceTags, {
        cascade: true
    })
    service: string;

    @ManyToOne(type => Tag, tag => tag.serviceTags, {
        cascade: true
    })
    tag: string;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date;

    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date;
}
