import { EntityRepository, Repository } from "typeorm";
import { Tag } from "../entity/Tag";
import { ServiceTag } from "../entity/ServiceTag";

@EntityRepository(Tag)
export class TagRepository extends Repository<Tag> {
    findAllTag(): Promise<Tag[]> {
        return this.find();
    }

    findOneTag(name: string): Promise<Tag> {
        return this.findOne(name);
    }

    async saveTag(Tag: Tag): Promise<void> {
        await this.save(Tag);
    }
    
    async saveServiceTag(ServiceTag: ServiceTag): Promise<void> {
        await this.save(ServiceTag);
    }

    async deleteTag(name: string): Promise<void> {
        await this.delete({ name : name });
    }

    findByTagName(name: string) {
        return this.createQueryBuilder("name")
            .where("Tag.name = :name", { name })
            .getMany()
    }

    async findServiceWithTag(name: string) {
        return await this.createQueryBuilder("tag")
        .select("tag.name", "tag")
        .addSelect("service.*")
        .innerJoin("tag.serviceTags", "serviceTag")
        .where(`tag.name = "${name}"`)
        .innerJoin("serviceTag.service", "service")
        .getRawMany()
    }
}
