import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Payment } from "./Payment";
import { Product } from "./Product";
import { User } from "./User";

type Period = "1W" | "2W" | "1M";

@Entity()
export class Subscribe {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.subscribes, 
        { cascade: true })
    user: string;

    @ManyToOne(type => Product, product => product.subscribes, 
        { cascade: true })
    product: string;

    @Column({ length: 50, nullable: false })
    period: Period;

    @Column({ type: "date", nullable: false })
    subscribeDate: Date;

    @Column({ type: "date", nullable: true })
    expiredDate: Date;

    @Column({ type: "date", nullable: true})
    reSubscribeDate: Date;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => Payment, payment => payment.subscribe)
    payments: Payment[];
}