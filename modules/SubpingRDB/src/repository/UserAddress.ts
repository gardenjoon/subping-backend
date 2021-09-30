import { EntityRepository, Repository } from "typeorm";
import { UserAddress } from "../entity/UserAddress";

@EntityRepository(UserAddress)
export class UserAddressRepository extends Repository<UserAddress> {
    // 주소 생성
    async createUserAddress(addressModel: UserAddress) {
        await this.save(addressModel);
    }

    // 해당 주소 업데이트 (변경하지 않을땐 원래값 적용)
    async updateUserAddress(UserAddressId: string, option?:{
        userName?: string,
        userPhoneNumber?: string, 
        postCode?: string,
        address?: string,
        detailedAddress?: string,
        isDefault?: boolean
    }): Promise<void> {
        const { userName, userPhoneNumber, postCode, address, detailedAddress, isDefault } = option;

        const userAddress = await this.findOne(UserAddressId);

        await this.update(UserAddressId, {
            userName : userName || userAddress.userName,
            userPhoneNumber : userPhoneNumber || userAddress.userPhoneNumber,
            postCode : postCode || userAddress.postCode,
            address : address || userAddress.address,
            detailedAddress : detailedAddress || userAddress.detailedAddress,
            isDefault : isDefault || userAddress.isDefault
        });
    }

    // 해당 주소 제거
    async deleteUserAddress(addressId: string) {
        await this.delete(addressId);
    }

    // 해당 유저의 모든 주소 반환
    async queryAllUserAddresses(userId: string) {
        return await this.createQueryBuilder("userAddress")
            .select("userAddress.*")
            .where(`userAddress.user = "${userId}"`)
            .getRawMany();
    }

    // 해당 유저의 기본 주소 반환
    async queryUserDefaultAddress(userId: string) {
        return await this.createQueryBuilder("userAddress")
            .select("userAddress.*")
            .where(`userAddress.user = "${userId}"`)
            .andWhere("userAddress.isDefault = True")
            .getRawOne();
    }

    // 해당 주소의 기본값 변경
    async updateUserDefaultAddress(userAddressId: string, isDefault: boolean) {
        return await this.update(userAddressId, {
            isDefault: isDefault
        });
    }

    // 해당 주소 반환
    async queryUserAddress(addressId: string) {
        return await this.createQueryBuilder("userAddress")
            .select("userAddress.*")
            .where(`userAddress.id = "${addressId}"`)
            .getRawOne();
    }
}