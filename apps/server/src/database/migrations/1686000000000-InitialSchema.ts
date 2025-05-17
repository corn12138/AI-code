import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1686000000000 implements MigrationInterface {
    name = 'InitialSchema1686000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建用户表
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "username" character varying NOT NULL,
        "fullName" character varying,
        "password" character varying NOT NULL,
        "avatar" character varying,
        "bio" character varying,
        "roles" jsonb NOT NULL DEFAULT '["user"]',
        "refreshToken" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

        // 创建分类表
        await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "slug" character varying,
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

        // 创建标签表
        await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        CONSTRAINT "UQ_tags_name" UNIQUE ("name"),
        CONSTRAINT "PK_tags" PRIMARY KEY ("id")
      )
    `);

        // 创建文章表
        await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "summary" text,
        "published" boolean NOT NULL DEFAULT false,
        "featuredImage" character varying,
        "slug" character varying,
        "viewCount" integer NOT NULL DEFAULT 0,
        "authorId" uuid NOT NULL,
        "categoryId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_articles" PRIMARY KEY ("id")
      )
    `);

        // 创建评论表
        await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "authorId" uuid NOT NULL,
        "articleId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments" PRIMARY KEY ("id")
      )
    `);

        // 创建低代码页面表
        await queryRunner.query(`
      CREATE TABLE "lowcode_pages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "content" jsonb NOT NULL,
        "description" character varying,
        "isHomePage" boolean NOT NULL DEFAULT false,
        "published" boolean NOT NULL DEFAULT false,
        "config" jsonb,
        "meta" jsonb,
        "ownerId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "publishedAt" TIMESTAMP,
        CONSTRAINT "UQ_lowcode_pages_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_lowcode_pages" PRIMARY KEY ("id")
      )
    `);

        // 创建文章-标签关联表
        await queryRunner.query(`
      CREATE TABLE "article_tags" (
        "articleId" uuid NOT NULL,
        "tagId" uuid NOT NULL,
        CONSTRAINT "PK_article_tags" PRIMARY KEY ("articleId", "tagId")
      )
    `);

        // 添加外键约束
        await queryRunner.query(`
      ALTER TABLE "articles" ADD CONSTRAINT "FK_articles_author" 
      FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

        await queryRunner.query(`
      ALTER TABLE "articles" ADD CONSTRAINT "FK_articles_category" 
      FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL
    `);

        await queryRunner.query(`
      ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_author" 
      FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

        await queryRunner.query(`
      ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_article" 
      FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE
    `);

        await queryRunner.query(`
      ALTER TABLE "lowcode_pages" ADD CONSTRAINT "FK_lowcode_pages_owner" 
      FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

        await queryRunner.query(`
      ALTER TABLE "article_tags" ADD CONSTRAINT "FK_article_tags_article" 
      FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE
    `);

        await queryRunner.query(`
      ALTER TABLE "article_tags" ADD CONSTRAINT "FK_article_tags_tag" 
      FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE
    `);

        // 创建UUID扩展（如果不存在）
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除所有表（按照相反的顺序）
        await queryRunner.query(`DROP TABLE "article_tags"`);
        await queryRunner.query(`DROP TABLE "lowcode_pages"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "articles"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
