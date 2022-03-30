import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {CreateUserDto} from "./dto/createUser.dto"
import {LoginUser} from "./dto/loginUser.dto"
import {UpdateUserDto} from "./dto/updateUser.dto"
import { Repository } from "typeorm"; 
import { InjectRepository } from "@nestjs/typeorm";
import {UserEntity} from "./user.entity"
import { sign } from "jsonwebtoken"
import {SECRET_JWT} from "../config"
import {userResponseInterface} from "./types/userResponse.interface"
import {compare, hash} from "bcrypt"

@Injectable()
export class UserService {
    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {}


    async createUser(createUser: CreateUserDto): Promise<UserEntity> {

        const errorResponse = {
            errors: {}
        }

        const isHasUserWithCurrentEmail = await this.userRepository.findOne({
            where: {
                email: createUser.email
            }
        })

        if (isHasUserWithCurrentEmail) {
            errorResponse.errors["email"] = "Пользователь с данным email уже существует"
        }

        const isHasUserWithCurrentUsername = await this.userRepository.findOne({
            where: {
                username: createUser.username
            }
        })

        if (isHasUserWithCurrentUsername) {
            errorResponse.errors["username"] = "Пользователь с данным username уже существует"
        }

        if (isHasUserWithCurrentEmail || isHasUserWithCurrentUsername) {
            throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY)
        }

        const newUser = new UserEntity()
        Object.assign(newUser,createUser)
        const res = await this.userRepository.save(newUser)
        console.log(res)
        return res
    }

    createJWT(user: UserEntity): string {
        return sign({
            id: user.id,
            username: user.username,
            email: user.email
        }, SECRET_JWT)
    }

    async login(user: LoginUser): Promise<UserEntity> {

        const errorResponse = {
            errors: {
                "email_or_password": "Email или пароль не подходит"
            }
        }

        const candidate = await this.userRepository.findOne({
            where: {
                email: user.email
            },
            select: ["bio", "email", "id", "image", "username", "password"]
        })

        if (!candidate) {
            throw new HttpException(errorResponse, HttpStatus.NOT_FOUND)
        }

        const isPasswordNotDifference = await compare(user.password, candidate.password)

        if (!isPasswordNotDifference) {
            throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST)
        }

        delete candidate.password

        return candidate

    }

    responseUser(user: UserEntity): userResponseInterface {
        return {
            user: {
                ...user,
                token: this.createJWT(user) 
            }
        }
    }

    findUserById(id: string): Promise<UserEntity> {
        return this.userRepository.findOne({where: {
            id
        }})
    }

    async updateCurrentUser(updateUserDto: UpdateUserDto, user: UserEntity): Promise<UserEntity> {
        const newUpdateUser: Partial<UserEntity> = {}
        if (updateUserDto.bio) {
            newUpdateUser.bio = updateUserDto.bio
        }

        if (updateUserDto.email) {
            newUpdateUser.email = updateUserDto.email
        }

        if (updateUserDto.image) {
            newUpdateUser.image = updateUserDto.image
        }

        if (updateUserDto.password) {
            const newHashPassword = await hash(updateUserDto.password, 10)
            newUpdateUser.password = newHashPassword
        }

        if (updateUserDto.image) {
            newUpdateUser.image = updateUserDto.image
        }

        if (updateUserDto.username) {
            newUpdateUser.username = updateUserDto.username
        }



        const joinUpdatesAndUser = Object.assign({}, user, newUpdateUser)

        const result = await this.userRepository.save(joinUpdatesAndUser)

        return result
    }

}
