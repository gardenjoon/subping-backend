import SubpingDDB from "subpingddb"
import AddressModel from "subpingddb/model/subpingTable/address"

import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    const subpingDDB = new SubpingDDB(process.env.subpingTable);
    const controller = subpingDDB.getController();

    await controller.read("PK-SK-Index", "jse", "ads")

    // const property: AddressModel = {

    // }

    // const controller = subpingDDB.getController();
    // await controller.create<AddressModel>(property);
    // await controller.readSKBeginsWith("PK-SK-Index", "subpingDDB", "s");
    // await controller.readSKBeginsWith("SK-PK-Index", "subpingDDB", "s");
    // await controller.readWithFilter("PK-SK-Index", "subpingDDB", "s", { ci: "test" }, true)

    return "done";
}
