import { MigrationInterface, QueryRunner } from "typeorm";

export class Subscribe1111337696944533 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE subscribe add addressId varchar(100) not null`);
        await queryRunner.query(`ALTER TABLE user_address add subscribeId varchar(100);`)
        await queryRunner.query(`ALTER TABLE subscribe add constraint subscribe_addressId_FK FOREIGN KEY(addressId) REFERENCES user_address(id);`);
        await queryRunner.query(`ALTER TABLE user_address add constraint addressId_subscribe_FK FOREIGN KEY(subscribeId) REFERENCES subscribe(id);`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE subscribe drop addressId`)
        await queryRunner.query(`ALTER TABLE user_address drop subscribeId`)
    }
}