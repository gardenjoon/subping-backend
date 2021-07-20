import {Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne} from "typeorm";
import { Service } from "./Service";

type RankTime = "06:00" | "12:00" | "18:00" | "24:00";

@Entity()
export class ServiceEvent {
    @PrimaryColumn()
    @OneToOne(type => Service, service => service.id, {
        cascade: true
    })
    @JoinColumn({
        name: "serviceId"
    })
    serviceId: string;
    
    @PrimaryColumn({
        type: "date"
    })
    date: Date;

    @PrimaryColumn()
    time: RankTime;

    @Column({
        nullable: false,
        default: 0
    })
    subscribe: Number;

    @Column({
        nullable: false,
        default: 0
    })
    view: Number;

    @Column({
        nullable: false,
        default: 0
    })
    review: Number;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date
    
    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date
}
