import {Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne} from "typeorm";
import { Service } from "./Service";

type RankTime = "06:00" | "12:00" | "18:00" | "24:00";

@Entity()
export class ServiceRank {
    @ManyToOne(type => Service, {
        cascade: true,
        primary: true
    })
    service: string;
    
    @PrimaryColumn({
        type: "date"
    })
    date: Date;

    @PrimaryColumn({
        length: 20
    })
    time: RankTime;

    @Column({
        nullable: false
    })
    rank: Number;

    @CreateDateColumn({
        nullable: false
    })
    createdAt: Date
    
    @UpdateDateColumn({
        nullable: false
    })
    updatedAt: Date
}
