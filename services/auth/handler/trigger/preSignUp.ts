'use strict';

import SubpingRDB, { Entity, Repository } from "subpingrdb";

// preSignUp 핸들러는, 회원가입에 사용되는 트리거입니다.
// 본 트리거에서 CI 값 검증 및 기타 필요한 작업을 수행합니다. 
export const handler = async (event, context, callback) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const userRepository = connection.getCustomRepository(Repository.User);
        const userModel = new Entity.User();

        userModel.id = event.userName;
        userModel.email = event.request.userAttributes.email;
        userModel.name = event.request.userAttributes.name;
        userModel.birthday = event.request.validationData.birthdate;
        userModel.carrier = event.request.validationData.carrier;
        userModel.gender = event.request.validationData.gender;
        userModel.phoneNumber = event.request.validationData['phone_number'];
        userModel.ci = event.request.validationData.ci;

        await userRepository.saveUser(userModel);

        // 회원가임 Confirm 자동 처리
        event.response.autoConfirmUser = true;
        event.response.autoVerifyEmail = true;
        
        callback(null, event);
    } catch (e) {
        
    }
};
