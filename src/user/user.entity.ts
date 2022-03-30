import { Entity, PrimaryGeneratedColumn,  Column, BeforeInsert, OneToMany, ManyToMany, JoinTable } from "typeorm";
import  {hash} from "bcrypt"
import {ArticleEntity} from "../article/article.entity"
import {CommentEntity} from "../article/comment.entity"

@Entity({name: "users"})
export class UserEntity {

    @PrimaryGeneratedColumn()
    id: string

    @Column()
    email: string

    @Column()
    username: string

    @Column({default: ""})
    bio: string

    @Column({default: ""})
    image: string

    @Column({select: false})
    password: string

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, 10)
    }
    
    @OneToMany(() => ArticleEntity, () => article => article.author) 
    articles: ArticleEntity[]

    @OneToMany(() => CommentEntity, () => comment => comment.author) 
    user_comments: CommentEntity[]

    @ManyToMany(() => ArticleEntity)
    @JoinTable()
    favorites: ArticleEntity[]
}
