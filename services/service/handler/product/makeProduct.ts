import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");

        const { serviceId, name, price, summary, productLogoUrl, available } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const productRepository = connection.getCustomRepository(Repository.Product);

        const serviceModel = new Entity.Service();
        serviceModel.id = serviceId

        const productModel = new Entity.Product();
        productModel.service = serviceModel
        productModel.name = name;
        productModel.price = price;
        productModel.summary = summary;
        productModel.productLogoUrl = productLogoUrl;
        productModel.available = available;
        await productRepository.createProduct(productModel);

        return success({
            success: true,
            message: "makeProductSuccess"
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "makeProductException"
        });
    }
}