import { EntityRepository, Repository } from "typeorm";
import { UserAddress } from "../entity/UserAddress";

@EntityRepository(UserAddress)
export class UserAddressRepository extends Repository<UserAddress> {
  async insertAddress(address: UserAddress) {
    await this.save(address);
  }

  async getUserAddresses(userEmail: string) {
      return await this.createQueryBuilder("userAddress")
        .select("userAddress.*")
        .where(`userAddress.user = "${userEmail}"`)
        .getRawMany();
  }

  async getUserDefaultAddress(userEmail: string) {
      return await this.createQueryBuilder("userAddress")
        .select("userAddress.*")
        .where(`userAddress.user = "${userEmail}"`)
        .andWhere("userAddress.default = True")
        .getRawMany();
  }

  async updateAddressDefault(id: string, isDefault: boolean) {
    return await this.update({
      id: id,
    }, {
      isDefault: isDefault
    });
  }
}