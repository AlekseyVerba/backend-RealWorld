import {ArticleEntity} from "../article.entity"
import {ArticleType} from "./article.type"

export interface MultipleArticlesResponseInterface {
    articles: ArticleType[],
    articlesCount: number
}