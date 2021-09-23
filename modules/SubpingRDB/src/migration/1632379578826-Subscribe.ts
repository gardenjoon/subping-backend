import {MigrationInterface, QueryRunner} from "typeorm";

export class Subscribe1632379578826 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE subscribe ADD address text null`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE subscribe DROP COLUMN address`);
    }
}
