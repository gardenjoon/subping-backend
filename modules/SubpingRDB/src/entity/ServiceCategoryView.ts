import { ViewEntity, Connection, ViewColumn } from "typeorm";
import { Category } from "./Category";
import { Service } from "./Service";
import { ServiceCategory } from "./ServiceCategory";

@ViewEntity({
    expression: (connection: Connection) => 
        connection.createQueryBuilder()

})

export class ServiceCategoryView {
    @ViewColumn()
    id: string;

    @ViewColumn()
    seller: string;

    @ViewColumn()
    name: string;

    @ViewColumn()
    category: string;

    @ViewColumn()
    type: string;

    @ViewColumn()
    serviceLogoUrl: string;

    @ViewColumn()
    summary: string;

    @ViewColumn()
    createdAt: Date;

    @ViewColumn()
    updatedAt: Date;
}