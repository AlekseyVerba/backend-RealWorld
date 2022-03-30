import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator"

export class LoginUser {
    @IsEmail({}, {message: "Неверный email"})
    readonly email: string

    @IsNotEmpty({message: "Пароль должен быть заполнен"})
    @MinLength(3, {message: "Для пароля минимальное количество 3 символа"})
    @MaxLength(12, {message: "Для пароля максимальное количество 12 символов"})
    readonly password: string
}