import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, ManyToOne } from "typeorm";
import { Service } from "./Service";

type RankTime = "03:00" | "09:00" | "15:00" | "21:00";

@Entity()
export class ServiceEvent {
    @ManyToOne(type => Service, service => service.serviceEvents, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE", primary: true })
    service: Service;

    @PrimaryColumn({ type: "date" })
    date: string;

    @PrimaryColumn({ length: 20 })
    time: RankTime | string;

    @Column({ nullable: false, default: 0 })
    subscribe: Number;

    @Column({ nullable: false, default: 0 })
    view: Number;

    @Column({ nullable: false, default: 0 })
    review: Number;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;
    
    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}