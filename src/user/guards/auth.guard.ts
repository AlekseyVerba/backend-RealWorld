import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Observable } from "rxjs";
import {ExpressRequestInterface} from "../../types/expressRequest.interface"

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const user = context.switchToHttp().getRequest<ExpressRequestInterface>()
        if (user.user) {
            return true
        }
// 
        console.log(user.user)
        throw new HttpException("Нету доступа", HttpStatus.UNAUTHORIZED)
    }
}