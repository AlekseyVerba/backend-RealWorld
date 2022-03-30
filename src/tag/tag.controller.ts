import { Controller, Get } from "@nestjs/common";
import { TagService } from "./tag.service";
import {TagEntity} from "./tag.entity"

@Controller('tags')
export class TagController {

    constructor(private readonly tagService: TagService) {}

    @Get()
    async getAllTags(): Promise<{tags: string[]}> {
        let tags = await this.tagService.findAll()
        let updateTags = tags.map(el => el.name)
        return {
            tags: updateTags
        }
    }

}