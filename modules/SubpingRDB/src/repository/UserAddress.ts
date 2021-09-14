import { EntityRepository, Repository } from "typeorm";
import { UserAddress } from "../entity/UserAddress";

@EntityRepository(UserAddress)
export class UserAddressRepository extends Repository<UserAddress> {
    async insertAddress(address: UserAddress) {
        await this.save(address);
    }

    async getUserAddresses(userId: string) {
        return await this.createQueryBuilder("userAddress")
            .select("userAddress.*")
            .where(`userAddress.user = "${userId}"`)
            .getRawMany();
    }

    async getUserDefaultAddress(userId: string) {
        return await this.createQueryBuilder("userAddress")
            .select("userAddress.*")
            .where(`userAddress.user = "${userId}"`)
            .andWhere("userAddress.isDefault = True")
            .getRawOne();
    }

    async updateAddressDefault(userAddressId: string, isDefault: boolean) {
        return await this.update(userAddressId, {
            isDefault: isDefault
        });
    }

    async updateUserAddress(UserAddressId: string, option?:{
        userName?: string, 
        userPhoneNumber?: string, 
        postCode?: string, 
        address?: string, 
        detailedAddress?: string,
        isDefault?: boolean
    }): Promise<void> {
        const { userName, userPhoneNumber, postCode, address, detailedAddress, isDefault } = option;

        const userAddress = await this.findOne(UserAddressId)

        await this.update(UserAddressId, {
            userName : userName || userAddress.userName,
            userPhoneNumber : userPhoneNumber || userAddress.userPhoneNumber,
            postCode : postCode || userAddress.postCode,
            address : address || userAddress.address,
            detailedAddress : detailedAddress || userAddress.detailedAddress,
            isDefault : isDefault || userAddress.isDefault
        })
    }
}