import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1764884969509 implements MigrationInterface {
    name = 'InitialMigration1764884969509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."item_mailing_mailing_type_enum" AS ENUM('1', '2', '3')`);
        await queryRunner.query(`CREATE TABLE "item_mailing" ("id" SERIAL NOT NULL, "mailing_id" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "mailing_type" "public"."item_mailing_mailing_type_enum" NOT NULL DEFAULT '1', CONSTRAINT "PK_edfdbb86848f65d60f3aa653116" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mailing" ("id" SERIAL NOT NULL, "email" character varying(512), "is_lock" boolean NOT NULL DEFAULT false, "user_id" character varying(100), "create_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_date" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_3d8e2e47d6d644c38d1192fcb15" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "item_mailing" ADD CONSTRAINT "FK_cc788e041cf0fd26486599f49af" FOREIGN KEY ("mailing_id") REFERENCES "mailing"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item_mailing" DROP CONSTRAINT "FK_cc788e041cf0fd26486599f49af"`);
        await queryRunner.query(`DROP TABLE "mailing"`);
        await queryRunner.query(`DROP TABLE "item_mailing"`);
        await queryRunner.query(`DROP TYPE "public"."item_mailing_mailing_type_enum"`);
    }

}
