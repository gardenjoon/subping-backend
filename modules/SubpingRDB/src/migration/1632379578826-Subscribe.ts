import {MigrationInterface, QueryRunner} from "typeorm";

export class Subscribe15157696944533 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE subscribe MODIFY address text`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE subscribe MODIFY address text not null`)
    }
}