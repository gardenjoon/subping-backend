import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";

type Period = "1W" | "2W" | "3W" | "1M" | "2M" | "3M";

@Entity()
export class ProductPeriod {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Product, service => service.periods, 
        { cascade: true })
    product: string;

    @Column({ length: 50, nullable: false })
    period: Period;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}