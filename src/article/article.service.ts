import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import {CreateArticleDto} from "./dto/createArticle.dto"
import {UserEntity} from "../user/user.entity"
import {ArticleEntity} from "./article.entity"
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DeleteResult } from "typeorm";
import slugify from "slugify"
import {generate} from "shortid"
import {ArticleResponseInterface} from "./types/articleResponse.interface"
import {UpadteArticleDto} from "./dto/updateArticle.dto"
import {queryGetArticles} from "./types/queryGetArticles.interface"
import {MultipleArticlesResponseInterface} from "./types/multipleArticlesResponse.interface"
import {ArticleType} from "./types/article.type"
import {FollowerEntity} from "../profile/followers.entity"
import {QueryGetFeedArticlesInterface} from "./types/queryGetFeedArticles.interface"
import {CommentEntity} from "./comment.entity"
import {CommentArticleDto} from "./dto/commentArticle.dto"
import {CommentArticleResponseInterface} from "./types/commentArticleResponse.interface"
import {MultipleCommentsResponseInterface} from "./types/multipleCommentResponse.interface"

@Injectable()
export class ArticleService {

    constructor(
        @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowerEntity) private readonly followerRepository: Repository<FollowerEntity>,
        @InjectRepository(CommentEntity) private readonly commentRepository: Repository<CommentEntity>
    ) {}

    async getAllArticles(query: queryGetArticles, userID: any): Promise<MultipleArticlesResponseInterface> {

        const queryBuilder = await this.articleRepository.createQueryBuilder("articles")
        .leftJoinAndSelect("articles.author", "author")

        queryBuilder.orderBy("articles.createdAt", "DESC")

        if (query.author) {
            const author = await this.userRepository.findOne({
                where: {
                    username: query.author
                }
            })

            queryBuilder.andWhere("author.id = :id", {id: author ? author.id : null})
        }

        if (query.favorited) {
            console.log(query.favorited)
            const favoriteUser = await this.userRepository.findOne({
                where: {
                    username: query.favorited
                },
                relations: ["favorites"]
            })

            let idxFavoriteArticles: number[] = []

            if (favoriteUser && favoriteUser.favorites.length > 0) {
                idxFavoriteArticles = favoriteUser.favorites.map(article => article.id)
                queryBuilder.andWhere("articles.id IN (:...ids)", {ids: idxFavoriteArticles})
            } else {
                queryBuilder.andWhere("1=0")
            }

            
            
        }   

        if (query.limit) {
            queryBuilder.limit(query.limit)
        }

        if (query.offset) {
            queryBuilder.offset(query.offset)
        }

        if (query.tag) {
            console.log(query.tag)
            queryBuilder.andWhere("articles.tagList LIKE :tag", {tag: `%${query.tag}%`})
        }

        let idxFavoriteArticles: number[] = []

        if (userID) {

            const currentUser = await this.userRepository.findOne({
                where: {
                    id: userID
                },
                relations: ["favorites"]
            })

            idxFavoriteArticles = currentUser.favorites.map(article => article.id)

        }

        const articlesCount = await queryBuilder.getCount()
        const articles = await queryBuilder.getMany()
        const articlesWithFavorite = articles.map(article => {
            const favorited = idxFavoriteArticles.includes(article.id)
            return {...article, favorited}
        })

        return {articles: articlesWithFavorite, articlesCount}
    }

    async getFeedArticles(query: QueryGetFeedArticlesInterface, currentUserID: any): Promise<MultipleArticlesResponseInterface> {
        const followers = await this.followerRepository.find({
            where: {
                followedUserId: currentUserID
            }
        })
        const idxAuthors = followers.map(item => item.followingUserId)
        if (idxAuthors.length === 0) {
            return {articles: [], articlesCount: 0}
        }

        const queryBuilder = await this.articleRepository.createQueryBuilder("articles").leftJoinAndSelect("articles.author", "author")

        queryBuilder.where("articles.authorId IN (:...ids)", {ids: idxAuthors})

        queryBuilder.orderBy("articles.createdAt", "DESC")

        const articlesCount = await queryBuilder.getCount()

        if (query.limit) {
            queryBuilder.limit(query.limit)
        }

        if (query.offset) {
            queryBuilder.offset(query.offset)
        }

        const articles = await queryBuilder.getMany()

        return {articles,articlesCount}
    }

    async createArticle(createArticleDto: CreateArticleDto, user: UserEntity): Promise<ArticleEntity> {

        const newArticle = Object.assign({},new ArticleEntity(), createArticleDto)
        console.log(newArticle)
        if (!createArticleDto.tagList) {
            newArticle.tagList = []
        }

        newArticle.author = user
        newArticle.slug = this.createSlug(createArticleDto.title)
        return await this.articleRepository.save(newArticle)
    }

    createSlug(title: string): string {
        return slugify(title + " " + generate(), {lower: true})
    }

    responseArticle(article: ArticleEntity): ArticleResponseInterface {
        return {article}
    }

    async findArticleBySlug(slug: string):Promise<ArticleEntity>  {
        const article = await this.articleRepository.findOne({
            where: {
                slug
            }
        })
        return article
    }

    async removeArticle(slug: string, userID: string): Promise<DeleteResult> {
        const currentSlug = await this.findArticleBySlug(slug)

        if (!currentSlug) {
            throw new HttpException("Пост не найден", HttpStatus.NOT_FOUND)
        }

        if (currentSlug.author.id !== userID) {
            throw new HttpException("Нету доступа к данному посту", HttpStatus.UNAUTHORIZED)
        }

        return await this.articleRepository.delete(currentSlug.id)
    }

    async updateArticle(slug: string, updateArticleDto: UpadteArticleDto, userID: string): Promise<ArticleEntity> {

        const currentArticle = await this.findArticleBySlug(slug)

        if (!currentArticle) {
            throw new HttpException("Пост не найден", HttpStatus.NOT_FOUND)
        }

        if (currentArticle.author.id !== userID) {
            throw new HttpException("У вас нету доступа", HttpStatus.UNAUTHORIZED)
        }

        const newArticle = Object.assign({}, currentArticle, updateArticleDto)

        if (updateArticleDto.title) {
            newArticle.slug = this.createSlug(updateArticleDto.title)
        }

        return await this.articleRepository.save(newArticle)
    }

    async userLikeArticle(slug: string, currentUserID: any): Promise<ArticleEntity> {
        console.log(currentUserID)
        const currentUser = await this.userRepository.findOne({
            where: {
                id: currentUserID
            },
            relations: ["favorites"]
        })
        console.log(currentUser)
        const currentArticle = await this.findArticleBySlug(slug)
        const isArticleInFavoritesCurrentUser = currentUser.favorites.findIndex(favoriteArticle => favoriteArticle.id === currentArticle.id) === -1

        if (isArticleInFavoritesCurrentUser) {
            currentUser.favorites.push(currentArticle)
            currentArticle.favoritesCount++

            await this.userRepository.save(currentUser)
            await this.articleRepository.save(currentArticle)
        }

        return currentArticle
    }

    async deleteUserLikeArticle(slug: string, currentUserID: any): Promise<ArticleEntity> {
        const currentUser = await this.userRepository.findOne({
            where: {
                id: currentUserID
            },
            relations: ["favorites"]
        })
        const currentArticle = await this.findArticleBySlug(slug)
        const indexArticleInFavorites = currentUser.favorites.findIndex(favoriteArticle => favoriteArticle.id === currentArticle.id)

        if (indexArticleInFavorites >= 0) {
            currentUser.favorites.splice(indexArticleInFavorites, 1)
            currentArticle.favoritesCount--
            await this.userRepository.save(currentUser)
            await this.articleRepository.save(currentArticle)
        }

        return currentArticle
    }

    async addCommentToArticle(commentArticleDto: CommentArticleDto, slugArticle: string, curentUserID: any): Promise<CommentEntity> {
        const newComment = new CommentEntity()
        const currentArticle = await this.articleRepository.findOne({
            where: {
                slug: slugArticle
            }
        })

        const currentUser = await this.userRepository.findOne({
            where: {
                id: curentUserID
            }
        })

        newComment.body = commentArticleDto.body
        newComment.author = currentUser
        newComment.article = currentArticle
        await this.commentRepository.save(newComment)
 

        return newComment
    }

    async deleteComment(slugArticle: string, idComment: any, currentUserID: string) {
        const queryBuilder = await this.commentRepository.createQueryBuilder("comments")
        .leftJoinAndSelect("comments.author", "author")
        .leftJoinAndSelect("comments.article", "article")
        .where("author.id = :authorID", {authorID: currentUserID})
        .andWhere("article.slug = :slug", {slug: slugArticle})
        .andWhere("comments.id = :idComment", { idComment})

        const item = await queryBuilder.getOne()
        await this.commentRepository.delete(item.id)

        return "ok"

    }

    async getCommentsFromArticle(slugArticle: string): Promise<CommentEntity[]> {
        const queryBuilder = this.commentRepository.createQueryBuilder("comments")
        .leftJoinAndSelect("comments.article","article")
        .leftJoinAndSelect("comments.author","author")
        .where("article.slug = :slug", {slug: slugArticle})
        queryBuilder.orderBy("comments.createdAt", "ASC")
        let result =  await queryBuilder.getMany()
        result = result.map(item => {
            delete item.author.email
            delete item.article
            return item
        })

        return result
    }

    responseComment(comment: CommentEntity): CommentArticleResponseInterface {
        delete comment.updateTimeStamp

        return {
            comment: comment
        }
    }

    responseMultipleComments(comments: CommentEntity[]): MultipleCommentsResponseInterface{
        return {
            comments: comments
        }
    }
 
}