import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const serviceRepository = connection.getCustomRepository(Repository.Service)
        const productRepository = connection.getCustomRepository(Repository.Product)
        const allService = await serviceRepository.findAllService();
        for (const service of allService){
            const productModel = new Entity.Product();
            productModel.service = service.id;
            if(service.name == "왓챠"){
                productModel.name = "Premium";
                productModel.price = 12900;
                productModel.summary = "스탠다드 요금제 입니다."
                productModel.productLogoUrl = "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png";
                productModel.available = true;
                console.log(productModel)
                await productRepository.saveProduct(productModel)
            }
        }

        return success({
            success: true,
            message: "makeCategorySuccess"
        })

    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "makeCategoryException"
        })
    }
}