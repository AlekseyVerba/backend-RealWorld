import {JwtPayload} from "jsonwebtoken"

export interface UserJwtPayloadInterface extends JwtPayload {
    id?: string
}