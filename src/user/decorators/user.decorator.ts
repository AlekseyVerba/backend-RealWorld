import { createParamDecorator, ExecutionContext } from "@nestjs/common"; 
import {UserEntity} from "../user.entity"
import {ExpressRequestInterface} from "../../types/expressRequest.interface"

export const User = createParamDecorator(
    (data: string | null, сtx:ExecutionContext ) => {
        const user: UserEntity = сtx.switchToHttp().getRequest<ExpressRequestInterface>().user
        if (!user) {
            return null
        }
        if (data) {
            return user[data]
        }
        return user
    }
)