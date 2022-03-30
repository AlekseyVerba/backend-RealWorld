import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {UserEntity} from "../user/user.entity"
import {ResponseProfileInterface} from "./types/responseProfile.interface"
import {ProfileType} from "./types/ProfileType.interface"
import {FollowerEntity} from "./followers.entity"

@Injectable()
export class ProfileService {

    constructor(
        @InjectRepository(UserEntity) private readonly profileRepository: Repository<UserEntity>,
        @InjectRepository(FollowerEntity) private readonly followerRepository: Repository<FollowerEntity>
    ) {}
    
    async getProfile(slug: string, followedUser: any): Promise<ProfileType> {
        const currentUser = await this.profileRepository.findOne({
            where: {
                username: slug
            }
        })

        if (!currentUser) {
            throw new HttpException("Профиль не найден", HttpStatus.NOT_FOUND)
        }

        const followed = await this.followerRepository.findOne({
            where: {
                followedUserId: followedUser,
                followingUserId: +currentUser.id
            }
        })

        return {...currentUser, following: Boolean(followed)}
    }

    async followToUser(followingUserName: any, currentUserID: any): Promise<ProfileType> {

        const followingUser = await this.profileRepository.findOne({
            where: {
                username: followingUserName
            }
        })


        if (!followingUser) {
            throw new HttpException("Профиль не найден", HttpStatus.NOT_FOUND)
        }

        if (currentUserID === followingUser.id) {
            throw new HttpException("Нельзя подписаться на самого себя", HttpStatus.BAD_REQUEST)
        }

        // const newFollower 

        const follower = await this.followerRepository.findOne({
            where: {
                followedUserId: currentUserID,
                followingUserId: +followingUser.id
            }
        })

        if (!follower) {
            const newFollower = new FollowerEntity()
            newFollower.followedUserId = currentUserID
            newFollower.followingUserId = +followingUser.id
            await this.followerRepository.save(newFollower)
        }


        return {
            ...followingUser,
            following: true
        }

    }

    async unfollowToUser(followingUserName: any, currentUserID: any): Promise<ProfileType> {
        const followingUser = await this.profileRepository.findOne({
            where: {
                username: followingUserName
            }
        })


        if (!followingUser) {
            throw new HttpException("Профиль не найден", HttpStatus.NOT_FOUND)
        }

        if (currentUserID === followingUser.id) {
            throw new HttpException("Нельзя отписаться от самого себя", HttpStatus.BAD_REQUEST)
        }


        await this.followerRepository.delete({
            followedUserId: currentUserID,
            followingUserId: +followingUser.id
        })

        return {
            ...followingUser,
            following: false
        }

    }

    responseProfile(user: ProfileType): ResponseProfileInterface{
        delete user.id
        delete user.email
        return {
            profile: user
        }
    }

}