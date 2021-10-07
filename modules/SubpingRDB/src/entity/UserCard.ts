import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany, RelationId } from "typeorm";
import { Subscribe } from "./Subscribe";
import { User } from "./User";

@Entity()
export class UserCard {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.userCards, 
        { nullable: false, onDelete: "CASCADE", onUpdate:  "CASCADE" })
    user: User;
    
    @RelationId((card: UserCard) => card.user)
    userId: string;

    @Column({ nullable: false })
    cardVendor: string;

    @Column({ nullable: false })
    cardName: string;

    @Column({ nullable: false })
    billingKey: string

    @Column({ nullable: false })
    pg: string;

    @Column({ nullable: false })
    method: string;

    @Column({ nullable: true })
    expiredAt: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ nullable: false })
    updatedAt: Date;

    @OneToMany(type => Subscribe, subscribe => subscribe.userCard, 
        { cascade: true })
    subscribes: Subscribe[]
}