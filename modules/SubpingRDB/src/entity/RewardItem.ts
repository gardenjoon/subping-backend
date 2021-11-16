import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import { Product } from "./Product";
import { Reward } from "./Reward";

@Entity()
export class RewardItem {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(type => Product, product => product.rewardItems,
        { onDelete: "CASCADE", onUpdate: "CASCADE" })
    product: Product;

    @ManyToOne(type => Reward, reward => reward.rewardItems,
        { onDelete: "CASCADE", onUpdate: "CASCADE" })
    reward: Reward;

    @Column({ nullable: false })
    amount: number;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;
}