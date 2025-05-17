import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateManualSchema1686000001000 implements MigrationInterface {
    name = 'CreateManualSchema1686000001000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 检查UUID扩展是否存在
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // 创建用户表
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" VARCHAR UNIQUE NOT NULL,
                "username" VARCHAR UNIQUE NOT NULL,
                "fullName" VARCHAR,
                "password" VARCHAR NOT NULL,
                "avatar" VARCHAR,
                "bio" VARCHAR,
                "roles" jsonb NOT NULL DEFAULT '["user"]',
                "refreshToken" VARCHAR,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // 创建分类表
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "categories" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" VARCHAR UNIQUE NOT NULL,
                "description" VARCHAR,
                "slug" VARCHAR
            )
        `);

        // 创建标签表
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "tags" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" VARCHAR UNIQUE NOT NULL
            )
        `);

        // 创建文章表
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "articles" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" VARCHAR NOT NULL,
                "content" TEXT NOT NULL,
                "summary" TEXT,
                "published" BOOLEAN NOT NULL DEFAULT false,
                "featuredImage" VARCHAR,
                "slug" VARCHAR,
                "viewCount" INTEGER NOT NULL DEFAULT 0,
                "authorId" uuid NOT NULL,
                "categoryId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // 创建评论表
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "comments" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "content" TEXT NOT NULL,
                "authorId" uuid NOT NULL,
                "articleId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // 创建低代码页面表
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "lowcode_pages" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" VARCHAR NOT NULL,
                "slug" VARCHAR UNIQUE NOT NULL,
                "content" jsonb NOT NULL,
                "description" VARCHAR,
                "isHomePage" BOOLEAN NOT NULL DEFAULT false,
                "published" BOOLEAN NOT NULL DEFAULT false,
                "config" jsonb,
                "meta" jsonb,
                "ownerId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "publishedAt" TIMESTAMP
            )
        `);

        // 创建文章-标签关联表
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "article_tags" (
                "articleId" uuid NOT NULL,
                "tagId" uuid NOT NULL,
                PRIMARY KEY ("articleId", "tagId")
            )
        `);

        // 添加外键约束
        await queryRunner.query(`
            ALTER TABLE "articles" 
            ADD CONSTRAINT "FK_articles_author" 
            FOREIGN KEY ("authorId") REFERENCES "users"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "articles" 
            ADD CONSTRAINT "FK_articles_category" 
            FOREIGN KEY ("categoryId") REFERENCES "categories"("id") 
            ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "comments" 
            ADD CONSTRAINT "FK_comments_author" 
            FOREIGN KEY ("authorId") REFERENCES "users"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "comments" 
            ADD CONSTRAINT "FK_comments_article" 
            FOREIGN KEY ("articleId") REFERENCES "articles"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "lowcode_pages" 
            ADD CONSTRAINT "FK_lowcode_pages_owner" 
            FOREIGN KEY ("ownerId") REFERENCES "users"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "article_tags" 
            ADD CONSTRAINT "FK_article_tags_article" 
            FOREIGN KEY ("articleId") REFERENCES "articles"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "article_tags" 
            ADD CONSTRAINT "FK_article_tags_tag" 
            FOREIGN KEY ("tagId") REFERENCES "tags"("id") 
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 按照依赖关系的反序删除所有表
        await queryRunner.query(`ALTER TABLE IF EXISTS "article_tags" DROP CONSTRAINT IF EXISTS "FK_article_tags_tag"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "article_tags" DROP CONSTRAINT IF EXISTS "FK_article_tags_article"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "lowcode_pages" DROP CONSTRAINT IF EXISTS "FK_lowcode_pages_owner"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "comments" DROP CONSTRAINT IF EXISTS "FK_comments_article"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "comments" DROP CONSTRAINT IF EXISTS "FK_comments_author"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "articles" DROP CONSTRAINT IF EXISTS "FK_articles_category"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "articles" DROP CONSTRAINT IF EXISTS "FK_articles_author"`);

        await queryRunner.query(`DROP TABLE IF EXISTS "article_tags"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "lowcode_pages"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "articles"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    }
}
