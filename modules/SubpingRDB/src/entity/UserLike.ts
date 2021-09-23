import { Entity, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Service } from "./Service";
import { User } from "./User";

@Entity()
export class UserLike {
    @ManyToOne(type => User, user => user.userLikes, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE", primary: true })
    user: string;

    @ManyToOne(type => Service, service => service.userLikes, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE", primary: true })
    service: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}