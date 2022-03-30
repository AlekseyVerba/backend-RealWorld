import { IsNotEmpty } from "class-validator"

export class CreateArticleDto {
    @IsNotEmpty({message: "Поле заголовока должно быть заполнено"})
    readonly title: string
    @IsNotEmpty({message: "Поле описания должно быть заполнено"})
    readonly description: string
    @IsNotEmpty({message: "Поле тело должно быть заполнено"})
    readonly body: string
    readonly tagList: string[]
}