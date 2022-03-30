import { Controller, Post, Body, UseGuards, UsePipes, Get, Param, Delete, Put, Query } from "@nestjs/common";
import { DeleteResult } from "typeorm";
import {ArticleService} from "./article.service"
import {CreateArticleDto} from "./dto/createArticle.dto"
import {User} from "../user/decorators/user.decorator"
import {UserEntity} from "../user/user.entity"
import {AuthGuard} from "../user/guards/auth.guard"
import {ArticleResponseInterface} from "./types/articleResponse.interface"
import {UpadteArticleDto} from "./dto/updateArticle.dto"
import {queryGetArticles} from "./types/queryGetArticles.interface"
import {MultipleArticlesResponseInterface} from "./types/multipleArticlesResponse.interface"
import {QueryGetFeedArticlesInterface} from "./types/queryGetFeedArticles.interface"
import {BackendValidationPipe} from "../shared/pipe/backendValidation.pipe"
import {CommentArticleDto} from "./dto/commentArticle.dto"
import {CommentArticleResponseInterface} from "./types/commentArticleResponse.interface"
import {MultipleCommentsResponseInterface} from "./types/multipleCommentResponse.interface"



@Controller("articles")
export class ArticleController {

    constructor(private readonly articleService: ArticleService) {}

    @Get()
    async getAllArticles(
        @Query() query: queryGetArticles,
        @User("id") userID: any
    ): Promise<MultipleArticlesResponseInterface> {
        return await this.articleService.getAllArticles(query, userID)
    }

    @Get("feed")
    @UseGuards(AuthGuard)
    async getFeedArticles(

        @Query() query: QueryGetFeedArticlesInterface,
        @User("id") currentUserID: any

    ): Promise<MultipleArticlesResponseInterface> {

        return await this.articleService.getFeedArticles(query, currentUserID)
    }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(BackendValidationPipe)
    async createArticle(
        @Body("article") createArticleDto: CreateArticleDto,
        @User() user: UserEntity
    ): Promise<ArticleResponseInterface> {
        const newArticle = await this.articleService.createArticle(createArticleDto, user)
        return this.articleService.responseArticle(newArticle)
    }

    @Post(":slug/favorite")
    @UseGuards(AuthGuard)
    async userLikeArticle(

        @Param("slug") slug: string,
        @User("id") currentUserID: string

    ): Promise<ArticleResponseInterface> {
        const result = await this.articleService.userLikeArticle(slug, currentUserID)
        return this.articleService.responseArticle(result)
    }

    @Delete(":slug/favorite")
    @UseGuards(AuthGuard)
    async deleteUserLikeArticle(

        @Param("slug") slug:string,
        @User("id") curentUserID: string

    ):Promise<ArticleResponseInterface> {
        console.log("wwfw")
        const result = await this.articleService.deleteUserLikeArticle(slug, curentUserID)
        return this.articleService.responseArticle(result)
    }

    @Get(":slug")
    async getArticle(@Param("slug") slug: string): Promise<ArticleResponseInterface> {
        const article = await this.articleService.findArticleBySlug(slug)
        return this.articleService.responseArticle(article)
    }

    @Delete(":slug")
    @UseGuards(AuthGuard)
    async removeArticle(
        @Param("slug") slug: string,
        @User("id") userID: string
    ) {

        return this.articleService.removeArticle(slug, userID)

    }


    @Put(":slug")
    @UseGuards(AuthGuard)
    async updateArticle(
        @Param("slug") slug: string,
        @Body("article") updateArticleDto: UpadteArticleDto,
        @User("id") userID: string
    ): Promise<ArticleResponseInterface> {

        const currentArticle = await this.articleService.updateArticle(slug, updateArticleDto, userID)
        return await this.articleService.responseArticle(currentArticle)
    }


    @Post(":slug/comments")
    @UseGuards(AuthGuard)
    async addCommentToArticle(

        @Body("comment") commentArticleDto: CommentArticleDto,
        @Param("slug") slugArticle: string,
        @User("id") currentUserID: any

    ): Promise<CommentArticleResponseInterface> {
        const result = await this.articleService.addCommentToArticle(commentArticleDto, slugArticle, currentUserID)
        return this.articleService.responseComment(result)
    }

    @Delete(":slug/comments/:id")
    @UseGuards(AuthGuard)
    async deleteComment(

        @User("id") currentUserID: any,
        @Param("slug") slugArticle: string,
        @Param("id") idComment: any

    ) {
        await this.articleService.deleteComment(slugArticle, idComment, currentUserID)
        return "good"
    }


    @Get(":slug/comments")
    async getCommentsFromArticle(
        @Param("slug") slugArticle: string
    ): Promise<MultipleCommentsResponseInterface> {
        const result = await this.articleService.getCommentsFromArticle(slugArticle)
        return this.articleService.responseMultipleComments(result)
    }


}