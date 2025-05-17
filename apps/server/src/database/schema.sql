-- 创建UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
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
);

-- 创建分类表
CREATE TABLE IF NOT EXISTS "categories" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR UNIQUE NOT NULL,
    "description" VARCHAR,
    "slug" VARCHAR
);

-- 创建标签表
CREATE TABLE IF NOT EXISTS "tags" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR UNIQUE NOT NULL
);

-- 创建文章表
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
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS "comments" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "content" TEXT NOT NULL,
    "authorId" uuid NOT NULL,
    "articleId" uuid NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- 创建低代码页面表
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
);

-- 创建文章-标签关联表
CREATE TABLE IF NOT EXISTS "article_tags" (
    "articleId" uuid NOT NULL,
    "tagId" uuid NOT NULL,
    PRIMARY KEY ("articleId", "tagId")
);

-- 添加外键约束
ALTER TABLE "articles" 
ADD CONSTRAINT "FK_articles_author" 
FOREIGN KEY ("authorId") REFERENCES "users"("id") 
ON DELETE CASCADE;

ALTER TABLE "articles" 
ADD CONSTRAINT "FK_articles_category" 
FOREIGN KEY ("categoryId") REFERENCES "categories"("id") 
ON DELETE SET NULL;

ALTER TABLE "comments" 
ADD CONSTRAINT "FK_comments_author" 
FOREIGN KEY ("authorId") REFERENCES "users"("id") 
ON DELETE CASCADE;

ALTER TABLE "comments" 
ADD CONSTRAINT "FK_comments_article" 
FOREIGN KEY ("articleId") REFERENCES "articles"("id") 
ON DELETE CASCADE;

ALTER TABLE "lowcode_pages" 
ADD CONSTRAINT "FK_lowcode_pages_owner" 
FOREIGN KEY ("ownerId") REFERENCES "users"("id") 
ON DELETE CASCADE;

ALTER TABLE "article_tags" 
ADD CONSTRAINT "FK_article_tags_article" 
FOREIGN KEY ("articleId") REFERENCES "articles"("id") 
ON DELETE CASCADE;

ALTER TABLE "article_tags" 
ADD CONSTRAINT "FK_article_tags_tag" 
FOREIGN KEY ("tagId") REFERENCES "tags"("id") 
ON DELETE CASCADE;
