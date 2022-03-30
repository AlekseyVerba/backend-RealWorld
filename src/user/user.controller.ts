import { Controller, Post, Body, Get, Req, UseGuards, Put } from "@nestjs/common";
import {UserService} from "./user.service"
import {CreateUserDto} from "./dto/createUser.dto"
import {userResponseInterface} from "./types/userResponse.interface"
import { UsePipes } from "@nestjs/common";
import {BackendValidationPipe} from "../shared/pipe/backendValidation.pipe"
import {LoginUser} from "./dto/loginUser.dto"
import {User} from "./decorators/user.decorator"
import {UserEntity} from "./user.entity" 
import {AuthGuard} from "./guards/auth.guard"
import {UpdateUserDto} from "./dto/updateUser.dto"

@Controller()
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Post('users')
    @UsePipes(BackendValidationPipe)
    async createUser(@Body('user') createUserDto: CreateUserDto): Promise<userResponseInterface> {
        const user = await this.userService.createUser(createUserDto)
        return this.userService.responseUser(user)
    }

    @Post("users/login")
    @UsePipes(BackendValidationPipe)
    async login(@Body("user") loginUserDto: LoginUser): Promise<userResponseInterface> {
        const user = await this.userService.login(loginUserDto)
        return this.userService.responseUser(user)
    }

    @Get("user")
    @UseGuards(AuthGuard)
    getCurrentUser(
        @User() user: UserEntity,
    ): userResponseInterface {
        
        return this.userService.responseUser(user)
    }

    @Put("user")
    @UseGuards(AuthGuard)
    async updateCurrentUser(
        @Body("user") updateUserDto: UpdateUserDto,
        @User() user: UserEntity
    ): Promise<userResponseInterface> {
        const resultUpdate = await this.userService.updateCurrentUser(updateUserDto, user)
        return this.userService.responseUser(resultUpdate)
        
    }
}