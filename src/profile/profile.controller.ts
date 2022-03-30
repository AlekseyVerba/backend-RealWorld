import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import {ProfileService} from "./profile.service"
import {User} from "../user/decorators/user.decorator"
import {ResponseProfileInterface} from "./types/responseProfile.interface"
import {AuthGuard} from "../user/guards/auth.guard"

@Controller("profiles")
export class ProfileController {

    constructor(private readonly profileService: ProfileService){}

    @Get(":slug")
    async getProfile(

        @Param("slug") slug: string,
        @User("id") currentUserID: any

    ): Promise<ResponseProfileInterface> {
        const result = await this.profileService.getProfile(slug, currentUserID)
        return this.profileService.responseProfile(result)
    }

    @Post(":username/follow")
    @UseGuards(AuthGuard)
    async followToUser(

        @Param("username") followingUserName: any,
        @User("id") currentUserID: any

    ): Promise<ResponseProfileInterface>{

        const result = await this.profileService.followToUser(followingUserName, currentUserID)
        return this.profileService.responseProfile(result)

    }

    @Delete(":username/follow")
    @UseGuards(AuthGuard)    
    async unfollowToUser(

        @Param("username") followingUserName: any,
        @User("id") currentUserID: any

    ): Promise<ResponseProfileInterface> {

        const result = await this.profileService.unfollowToUser(followingUserName, currentUserID)
        return this.profileService.responseProfile(result)

    }
}