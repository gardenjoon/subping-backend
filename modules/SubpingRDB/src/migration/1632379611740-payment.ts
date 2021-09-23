import {MigrationInterface, QueryRunner} from "typeorm";

export class payment1632379611740 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE payment ADD amount INT NOT NULL`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE payment DROP COLUMN amount`);
    }
}
