import {MigrationInterface, QueryRunner} from "typeorm";

export class Service1627975378883 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table service change serviceLogoUrl serviceSquareLogoUrl`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table service change serviceSquareLogoUrl serviceLogoUrl`);
    }
}
