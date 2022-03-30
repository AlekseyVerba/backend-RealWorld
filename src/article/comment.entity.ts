import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate, ManyToOne } from "typeorm";
import {UserEntity} from "../user/user.entity"
import {ArticleEntity} from "./article.entity"

@Entity({name: "comments"})
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date

    @Column({default: ""})
    body: string

    @BeforeUpdate()
    updateTimeStamp() {
        this.updatedAt = new Date()
    }

    @ManyToOne(() => UserEntity, user => user.user_comments, {eager: true})
    author: UserEntity

    @ManyToOne(() => ArticleEntity, article => article, {eager: true})
    article: ArticleEntity
}