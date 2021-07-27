import { Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany}  from "typeorm";
import { ServiceTag } from "./ServiceTag";

@Entity()
export class Tag {
    @PrimaryColumn({
        length: 100
    })
    name: string;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date;

    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date;

    @OneToMany(type => ServiceTag, serviceTag => serviceTag.tag)
    serviceTags: ServiceTag[];
}