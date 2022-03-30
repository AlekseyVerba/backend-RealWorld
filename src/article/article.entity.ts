import { Column, Entity, PrimaryGeneratedColumn, BeforeUpdate, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import {UserEntity} from "../user/user.entity"
import {CommentEntity} from "./comment.entity"

@Entity({name: "articles"})
export class ArticleEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    slug: string

    @Column()
    title: string

    @Column({default: ""})
    description: string

    @Column({default: ""})
    body: string

    @Column('simple-array')
    tagList: string[]

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date

    @Column({default: 0})
    favoritesCount: number

    @BeforeUpdate()
    updateTimeStamp() {
        this.updatedAt = new Date()
    }

    @ManyToOne(() => UserEntity, user => user.articles, {eager: true})
    author: UserEntity

    @ManyToOne(() => CommentEntity, comment => comment.article)
    commentsInThisArticle: CommentEntity[]

}