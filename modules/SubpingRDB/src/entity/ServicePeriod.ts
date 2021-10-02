import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Service } from "./Service";

type Period = "1W" | "2W" | "3W" | "1M" | "2M" | "3M";

@Entity()
export class ServicePeriod {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Service, service => service.periods, 
        { onDelete: "CASCADE", onUpdate:  "CASCADE" })
    service: Service;

    @Column({ length: 50, nullable: false })
    period: Period;

    @Column({ nullable: false, default: false })
    default: boolean;
    
    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}