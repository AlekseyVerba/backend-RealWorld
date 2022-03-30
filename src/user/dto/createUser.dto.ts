import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator"

export class CreateUserDto {
    @IsNotEmpty({message: "Имя должно быть заполнено"})
    @MinLength(2, {message: "Для имени минимальное количество 2 символа"})
    @MaxLength(15, {message: "Для имени максимальное количество 15 символов"})
    readonly username: string

    @IsEmail({}, {message: "Неверный email"})
    readonly email: string

    @IsNotEmpty({message: "Пароль должен быть заполнен"})
    @MinLength(3, {message: "Для пароля минимальное количество 3 символа"})
    @MaxLength(12, {message: "Для пароля максимальное количество 12 символов"})
    readonly password: string
}