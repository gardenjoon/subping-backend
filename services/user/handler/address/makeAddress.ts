import SubpingDDB from "subpingddb"
import CiModel from "subpingddb/model/subpingTable/ci"

import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    const subpingDDB = new SubpingDDB(process.env.subpingTable);
    const property: CiModel = {
        "PK": "subpingDDB",
        "SK": "subpingDDB",
        "ci": "test",
        "createdAt": "test",
        "updatedAt": "test",
        "model": "ci"
    }

    const controller = subpingDDB.getController();
    await controller.create<CiModel>(property);
    await controller.readSKBeginsWith("PK-SK-Index", "subpingDDB", "s");
    await controller.readSKBeginsWith("SK-PK-Index", "subpingDDB", "s");
    await controller.readWithFilter("PK-SK-Index", "subpingDDB", "s", { ci: "test" }, true)
    // const data = await controller.read(process.env.subpingTable, "PK-SK-Index", "jsw9808@gmail.com")
    // const data2 = await controller.read("SK-PK-Index", "subpingDDB")

    // console.log(data.Items)
    // console.log(data2)
    return "done";
}
$