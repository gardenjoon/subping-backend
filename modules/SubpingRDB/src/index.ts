import "reflect-metadata";
import * as path from 'path';
import {createConnection, getConnectionOptions} from "typeorm";
import { User } from "./entity/User";

type StageType = "prod" | "dev";

class SubpingRDB {
    async createConnection(stage: StageType) {
        const options = await getConnectionOptions();
        
        Object.assign(options, {
            type: "aurora-data-api",
            database: `subping`,
            secretArn: "arn:aws:secretsmanager:ap-northeast-2:068162191174:secret:dev/admin/subping-xQSws2",
            resourceArn: "arn:aws:rds:ap-northeast-2:068162191174:cluster:subping-dev",
            region: "ap-northeast-2",
        })

        return await createConnection(options)
    }    
}

const test = async () => {
    const subpingRDB = new SubpingRDB()
    const connection = await subpingRDB.createConnection("dev");
    console.log(connection);
    
    const userRepository = connection.getRepository(User);
    console.log(userRepository);
}

test();

export default SubpingRDB;