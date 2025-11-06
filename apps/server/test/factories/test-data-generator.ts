/**
 * 测试数据生成器
 * 基于最新的 Vitest 3.x 特性，提供完整的测试数据生成功能
 */

import { faker } from '@faker-js/faker';
import { Article } from '../../src/articles/article.entity';
import { Category } from '../../src/articles/category.entity';
import { Comment } from '../../src/articles/comment.entity';
import { MobileDoc } from '../../src/mobile/entities/mobile-doc.entity';
import { Tag } from '../../src/tags/tag.entity';
import { User } from '../../src/user/entities/user.entity';

export interface TestDataOptions {
    locale?: string;
    seed?: number;
    count?: number;
}

export class TestDataGenerator {
    private static instance: TestDataGenerator;
    private faker: typeof faker;

    constructor(options: TestDataOptions = {}) {
        this.faker = faker;

        if (options.locale) {
            this.faker.setLocale(options.locale);
        }

        if (options.seed) {
            this.faker.seed(options.seed);
        }
    }

    static getInstance(options: TestDataOptions = {}): TestDataGenerator {
        if (!TestDataGenerator.instance) {
            TestDataGenerator.instance = new TestDataGenerator(options);
        }
        return TestDataGenerator.instance;
    }

    // 用户数据生成
    generateUser(overrides: Partial<User> = {}): User {
        const user = new User();
        user.id = overrides.id || this.faker.string.uuid();
        user.email = overrides.email || this.faker.internet.email();
        user.username = overrides.username || this.faker.internet.userName();
        user.password = overrides.password || this.faker.internet.password();
        user.firstName = overrides.firstName || this.faker.person.firstName();
        user.lastName = overrides.lastName || this.faker.person.lastName();
        user.roles = overrides.roles || ['user'];
        user.createdAt = overrides.createdAt || this.faker.date.past();
        user.updatedAt = overrides.updatedAt || this.faker.date.recent();
        user.refreshToken = overrides.refreshToken || null;

        return user;
    }

    generateUsers(count: number = 5, overrides: Partial<User> = {}): User[] {
        return Array.from({ length: count }, () => this.generateUser(overrides));
    }

    // 文章数据生成
    generateArticle(overrides: Partial<Article> = {}): Article {
        const article = new Article();
        article.id = overrides.id || this.faker.string.uuid();
        article.title = overrides.title || this.faker.lorem.sentence();
        article.content = overrides.content || this.faker.lorem.paragraphs(5);
        article.summary = overrides.summary || this.faker.lorem.sentence();
        article.published = overrides.published ?? this.faker.datatype.boolean();
        article.featuredImage = overrides.featuredImage || this.faker.image.url();
        article.slug = overrides.slug || this.faker.lorem.slug();
        article.viewCount = overrides.viewCount || this.faker.number.int({ min: 0, max: 1000 });
        article.authorId = overrides.authorId || this.faker.string.uuid();
        article.categoryId = overrides.categoryId || this.faker.string.uuid();
        article.createdAt = overrides.createdAt || this.faker.date.past();
        article.updatedAt = overrides.updatedAt || this.faker.date.recent();

        return article;
    }

    generateArticles(count: number = 5, overrides: Partial<Article> = {}): Article[] {
        return Array.from({ length: count }, () => this.generateArticle(overrides));
    }

    // 标签数据生成
    generateTag(overrides: Partial<Tag> = {}): Tag {
        const tag = new Tag();
        tag.id = overrides.id || this.faker.string.uuid();
        tag.name = overrides.name || this.faker.lorem.word();
        tag.slug = overrides.slug || this.faker.lorem.slug();
        tag.color = overrides.color || this.faker.color.rgb();
        tag.description = overrides.description || this.faker.lorem.sentence();
        tag.createdAt = overrides.createdAt || this.faker.date.past();
        tag.updatedAt = overrides.updatedAt || this.faker.date.recent();

        return tag;
    }

    generateTags(count: number = 5, overrides: Partial<Tag> = {}): Tag[] {
        return Array.from({ length: count }, () => this.generateTag(overrides));
    }

    // 分类数据生成
    generateCategory(overrides: Partial<Category> = {}): Category {
        const category = new Category();
        category.id = overrides.id || this.faker.string.uuid();
        category.name = overrides.name || this.faker.lorem.word();
        category.slug = overrides.slug || this.faker.lorem.slug();
        category.description = overrides.description || this.faker.lorem.sentence();
        category.createdAt = overrides.createdAt || this.faker.date.past();
        category.updatedAt = overrides.updatedAt || this.faker.date.recent();

        return category;
    }

    generateCategories(count: number = 5, overrides: Partial<Category> = {}): Category[] {
        return Array.from({ length: count }, () => this.generateCategory(overrides));
    }

    // 评论数据生成
    generateComment(overrides: Partial<Comment> = {}): Comment {
        const comment = new Comment();
        comment.id = overrides.id || this.faker.string.uuid();
        comment.content = overrides.content || this.faker.lorem.sentence();
        comment.authorId = overrides.authorId || this.faker.string.uuid();
        comment.articleId = overrides.articleId || this.faker.string.uuid();
        comment.createdAt = overrides.createdAt || this.faker.date.past();
        comment.updatedAt = overrides.updatedAt || this.faker.date.recent();

        return comment;
    }

    generateComments(count: number = 5, overrides: Partial<Comment> = {}): Comment[] {
        return Array.from({ length: count }, () => this.generateComment(overrides));
    }

    // 移动端文档数据生成
    generateMobileDoc(overrides: Partial<MobileDoc> = {}): MobileDoc {
        const doc = new MobileDoc();
        doc.id = overrides.id || this.faker.string.uuid();
        doc.title = overrides.title || this.faker.lorem.sentence();
        doc.content = overrides.content || this.faker.lorem.paragraphs(3);
        doc.summary = overrides.summary || this.faker.lorem.sentence();
        doc.author = overrides.author || this.faker.person.fullName();
        doc.category = overrides.category || this.faker.lorem.word();
        doc.tags = overrides.tags || this.faker.lorem.words(3).split(' ');
        doc.isHot = overrides.isHot ?? this.faker.datatype.boolean();
        doc.published = overrides.published ?? this.faker.datatype.boolean();
        doc.readTime = overrides.readTime || this.faker.number.int({ min: 1, max: 30 });
        doc.sortOrder = overrides.sortOrder || this.faker.number.int({ min: 0, max: 100 });
        doc.imageUrl = overrides.imageUrl || this.faker.image.url();
        doc.docType = overrides.docType || this.faker.lorem.word();
        doc.filePath = overrides.filePath || this.faker.system.filePath();
        doc.createdAt = overrides.createdAt || this.faker.date.past();
        doc.updatedAt = overrides.updatedAt || this.faker.date.recent();

        return doc;
    }

    generateMobileDocs(count: number = 5, overrides: Partial<MobileDoc> = {}): MobileDoc[] {
        return Array.from({ length: count }, () => this.generateMobileDoc(overrides));
    }

    // 批量数据生成
    generateTestData(options: {
        users?: number;
        articles?: number;
        tags?: number;
        categories?: number;
        comments?: number;
        mobileDocs?: number;
    } = {}) {
        const {
            users = 5,
            articles = 10,
            tags = 8,
            categories = 3,
            comments = 20,
            mobileDocs = 15,
        } = options;

        return {
            users: this.generateUsers(users),
            articles: this.generateArticles(articles),
            tags: this.generateTags(tags),
            categories: this.generateCategories(categories),
            comments: this.generateComments(comments),
            mobileDocs: this.generateMobileDocs(mobileDocs),
        };
    }

    // 重置生成器
    reset() {
        this.faker.seed();
    }

    // 设置种子
    setSeed(seed: number) {
        this.faker.seed(seed);
    }
}

// 导出单例实例
export const testDataGenerator = TestDataGenerator.getInstance();

// 导出便捷方法
export const generateUser = (overrides?: Partial<User>) => testDataGenerator.generateUser(overrides);
export const generateUsers = (count?: number, overrides?: Partial<User>) => testDataGenerator.generateUsers(count, overrides);
export const generateArticle = (overrides?: Partial<Article>) => testDataGenerator.generateArticle(overrides);
export const generateArticles = (count?: number, overrides?: Partial<Article>) => testDataGenerator.generateArticles(count, overrides);
export const generateTag = (overrides?: Partial<Tag>) => testDataGenerator.generateTag(overrides);
export const generateTags = (count?: number, overrides?: Partial<Tag>) => testDataGenerator.generateTags(count, overrides);
export const generateCategory = (overrides?: Partial<Category>) => testDataGenerator.generateCategory(overrides);
export const generateCategories = (count?: number, overrides?: Partial<Category>) => testDataGenerator.generateCategories(count, overrides);
export const generateComment = (overrides?: Partial<Comment>) => testDataGenerator.generateComment(overrides);
export const generateComments = (count?: number, overrides?: Partial<Comment>) => testDataGenerator.generateComments(count, overrides);
export const generateMobileDoc = (overrides?: Partial<MobileDoc>) => testDataGenerator.generateMobileDoc(overrides);
export const generateMobileDocs = (count?: number, overrides?: Partial<MobileDoc>) => testDataGenerator.generateMobileDocs(count, overrides);
export const generateTestData = (options?: Parameters<typeof testDataGenerator.generateTestData>[0]) => testDataGenerator.generateTestData(options);
