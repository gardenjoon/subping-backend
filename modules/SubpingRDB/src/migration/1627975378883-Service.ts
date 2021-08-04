import {MigrationInterface, QueryRunner} from "typeorm";

export class Service1627975378883 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE service ADD serviceExplaneUrl VARCHAR(1000) null`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE service DROP COLUMN serviceExplaneUrl`);
    }
}
