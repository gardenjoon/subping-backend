import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class UserAddress {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.addresses, { nullable: false, cascade: true })
    user: string;
    
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
    default: boolean;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}