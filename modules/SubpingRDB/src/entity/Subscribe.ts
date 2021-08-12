import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";
import { User } from "./User";

@Entity()
export class Subscribe {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.subscribes, {
        cascade: true,
    })
    user: string;

    @ManyToOne(type => Product, product => product.subscribes, {
        cascade: true,
    })
    product: string;

    @Column({ type: "smallint", nullable: false })
    // 주기는 Day 기준입니다.
    period: Number;

    @Column({ type: "date", nullable: false })
    subscribeDate: string;

    @Column({ type: "date", nullable: true })
    expiredDate: string;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date

    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date
}