import SubpingRDB, { Repository } from "subpingrdb";

import { escapeRegExp } from "lodash";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

const createPattern = (str : string) => {
    const offset = 44032; //'가'의 코드

    if (/[가-힣]/.test(str)) {
        const stringCode =str.charCodeAt(0) - offset;
        if (stringCode % 28 > 0) {
            return str;
        }
        const begin = Math.floor(stringCode / 28) * 28 + offset;
        const end = begin + 27;
        return `[\\u${begin.toString(16)}-\\u${end.toString(16)}]`;
    }

    if (/[ㄱ-ㅎ]/.test(str)) {
        const chosung = {
        'ㄱ': '가'.charCodeAt(0),
        'ㄲ': '까'.charCodeAt(0),
        'ㄴ': '나'.charCodeAt(0),
        'ㄷ': '다'.charCodeAt(0),
        'ㄸ': '따'.charCodeAt(0),
        'ㄹ': '라'.charCodeAt(0),
        'ㅁ': '마'.charCodeAt(0),
        'ㅂ': '바'.charCodeAt(0),
        'ㅃ': '빠'.charCodeAt(0),
        'ㅅ': '사'.charCodeAt(0),
        };

        const begin = chosung[str] || ( (str.charCodeAt(0) - 12613 /* 'ㅅ'의 코드 */ ) * 588 + chosung['ㅅ'] );
        const end = begin + 587;

        return `[${str}\\u${begin.toString(16)}-\\u${end.toString(16)}]`;
    }

    return escapeRegExp(str);
}
const createRegExp = (input) => {
    const pattern = input.split('').map(createPattern).join('.*?');
    return new RegExp(pattern);
}

export const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
        const result = {
            "tagResult": [],
            "serviceResult": []
        };

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const serviceRepository = connection.getCustomRepository(Repository.Service);
        const serviceTagRepository = connection.getCustomRepository(Repository.ServiceTag);

        const requestWord = "ㄴ";

        const regExp = createRegExp(requestWord);

        const services = await serviceRepository.getServices({
            tag: true
        });
        const tags = await serviceTagRepository.getTags();

        for(const service of services) {
            const { name } = service;
            
            const regexResult = regExp.exec(name);

            if(regexResult) {
                result.serviceResult.push({
                    ...service,
                    matchedIndex: regexResult.index
                });
            }
        }

        for(const { tag } of tags) {
            const regexResult = regExp.exec(tag);

            if(regexResult) {
                result.tagResult.push({
                    matchedTag: tag,
                    matchedIndex: regexResult.index,
                    length: requestWord.length
                });
            }
        }

        return success({
            success: true,
            message: result
        })
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "SearchException"
        });
    }
}