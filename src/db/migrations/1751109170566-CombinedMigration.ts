import { MigrationInterface, QueryRunner } from 'typeorm';

export class CombinedMigration1751109170566 implements MigrationInterface {
  name = 'CombinedMigration1751109170566';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quiz" DROP CONSTRAINT "FK_33d6da0a57133d2405a96b5c1f3"`
    );
    await queryRunner.query(`ALTER TABLE "quiz_group" DROP COLUMN "order"`);
    await queryRunner.query(
      `ALTER TYPE "public"."material_mapper_material_type_enum" RENAME TO "material_mapper_material_type_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."material_mapper_material_type_enum" AS ENUM('video', 'quiz_group', 'quiz', 'link', 'article')`
    );
    await queryRunner.query(
      `ALTER TABLE "material_mapper" ALTER COLUMN "material_type" TYPE "public"."material_mapper_material_type_enum" USING "material_type"::"text"::"public"."material_mapper_material_type_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."material_mapper_material_type_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "quiz" ADD CONSTRAINT "FK_22b5fb931bf0e8b0efdb26fc945" FOREIGN KEY ("quiz_group_id") REFERENCES "quiz_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "articles" ADD "title" character varying NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "module" ADD "duration" integer NOT NULL`
    );

    await queryRunner.query(
      `CREATE TABLE "resource" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" character varying, "url" character varying, "content" text, "duration" integer NOT NULL, CONSTRAINT "PK_e2894a5867e06ae2e8889f1173f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "topic" character varying NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "topic"`);
    await queryRunner.query(`DROP TABLE "resource"`);

    await queryRunner.query(`ALTER TABLE "module" DROP COLUMN "duration"`);

    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "title"`);

    await queryRunner.query(
      `ALTER TABLE "quiz" DROP CONSTRAINT "FK_22b5fb931bf0e8b0efdb26fc945"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."material_mapper_material_type_enum_old" AS ENUM('resource', 'video', 'quiz', 'quiz_group', 'link', 'article')`
    );
    await queryRunner.query(
      `ALTER TABLE "material_mapper" ALTER COLUMN "material_type" TYPE "public"."material_mapper_material_type_enum_old" USING "material_type"::"text"::"public"."material_mapper_material_type_enum_old"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."material_mapper_material_type_enum"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."material_mapper_material_type_enum_old" RENAME TO "material_mapper_material_type_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_group" ADD "order" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "quiz" ADD CONSTRAINT "FK_33d6da0a57133d2405a96b5c1f3" FOREIGN KEY ("quiz_group_id") REFERENCES "quiz_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
