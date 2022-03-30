import { Injectable, NestMiddleware } from "@nestjs/common";
import { Response, NextFunction } from "express";
import { ExpressRequestInterface } from "../../types/expressRequest.interface"
import { JwtPayload, verify } from "jsonwebtoken"
import { SECRET_JWT } from "../../config"
import {UserService} from "../user.service"
import {UserJwtPayloadInterface} from "../../types/UserJwtPayload.interface"


@Injectable()
export class AuthMiddleware implements NestMiddleware {

    constructor(private readonly userServise: UserService) {}

    async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            req.user = null
            return next()
        }

        try {

            const token = req.headers.authorization.split(" ")[1]
            const decode = verify(token, SECRET_JWT) as UserJwtPayloadInterface
    
            req.user = await this.userServise.findUserById(decode.id)
            return next()

        } catch (e) {
            req.user = null
            return next()
        }
    }
}