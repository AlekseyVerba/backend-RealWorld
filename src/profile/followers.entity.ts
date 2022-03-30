import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "followers"})
export class FollowerEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    followedUserId: number

    @Column()
    followingUserId: number
}