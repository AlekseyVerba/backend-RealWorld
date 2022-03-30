import { PipeTransform, Injectable, ArgumentMetadata, HttpException, HttpStatus, ValidationError } from "@nestjs/common"; 
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class BackendValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        const object = plainToClass(metadata.metatype, value)
        const errors = await validate(object)

        if (typeof object !== "object") {
            return value
        }
 
        if (errors.length === 0) {
            return value
        }

        throw new HttpException({errors: this.formatError(errors)}, HttpStatus.UNPROCESSABLE_ENTITY)
    }

    formatError(errors: ValidationError[]) {
        return errors.reduce((acc, error) => {
            acc[error.property] = Object.values(error.constraints)
            return acc
        }, {})
    }
}