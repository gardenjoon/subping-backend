import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Subscribe } from "./Subscribe";

@Entity()
export class UserAddress {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.addresses, 
        { nullable: false, onDelete: "CASCADE", onUpdate:  "CASCADE" })
    user: User;
    
    @Column({ nullable: false })
    userName: string;

    @Column({ nullable: false})
    userPhoneNumber: string;

    @Column({ nullable: false })
    postCode: string;

    @Column({ nullable: false })
    address: string;

    @Column({ nullable: false })
    detailedAddress: string;

    @Column({ nullable: false, default: false })
    isDefault: boolean;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => Subscribe, subscribe => subscribe.address, 
        { nullable: true })
    subscribes: Subscribe[];
}