import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from "typeorm";
import { User } from "./User";

@Entity()
export class UserAddress {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.email, {
        nullable: false,
        cascade: true
    })
    @JoinColumn({ name: "userEmail"})
    userEmail: string;
    
    @Column({
        nullable: false
    })
    name: string;

    @Column({
        nullable: false
    })
    postCode: string;

    @Column({
        nullable: false
    })
    address: string;

    @Column({
        nullable: false
    })
    detailedAddress: string;

    @Column({
        nullable: false,
        default: false
    })
    default: boolean;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date;

    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date;
}
