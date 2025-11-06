import { faker } from '@faker-js/faker';

/**
 * 基础工厂类
 */
abstract class BaseFactory<T> {
    protected abstract definition(): Partial<T>;

    /**
     * 创建单个实例
     */
    create(overrides: Partial<T> = {}): T {
        return {
            ...this.definition(),
            ...overrides,
        } as T;
    }

    /**
     * 创建多个实例
     */
    createMany(count: number, overrides: Partial<T> = {}): T[] {
        return Array.from({ length: count }, () => this.create(overrides));
    }

    /**
     * 创建带有关联的实例
     */
    createWithRelations(relations: Record<string, any>, overrides: Partial<T> = {}): T {
        return {
            ...this.create(overrides),
            ...relations,
        } as T;
    }
}

/**
 * 用户工厂
 */
export class UserFactory extends BaseFactory<any> {
    protected definition() {
        return {
            id: faker.string.uuid(),
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: faker.internet.password({ length: 12 }),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            bio: faker.lorem.paragraph(),
            avatar: faker.image.avatar(),
            role: faker.helpers.arrayElement(['user', 'editor', 'admin']),
            isActive: true,
            emailVerified: true,
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
        };
    }

    /**
     * 创建管理员用户
     */
    createAdmin(overrides: Partial<any> = {}) {
        return this.create({
            role: 'admin',
            email: 'admin@test.com',
            username: 'admin',
            ...overrides,
        });
    }

    /**
     * 创建普通用户
     */
    createUser(overrides: Partial<any> = {}) {
        return this.create({
            role: 'user',
            ...overrides,
        });
    }

    /**
     * 创建编辑者
     */
    createEditor(overrides: Partial<any> = {}) {
        return this.create({
            role: 'editor',
            ...overrides,
        });
    }

    /**
     * 创建未验证用户
     */
    createUnverified(overrides: Partial<any> = {}) {
        return this.create({
            emailVerified: false,
            ...overrides,
        });
    }

    /**
     * 创建已停用用户
     */
    createInactive(overrides: Partial<any> = {}) {
        return this.create({
            isActive: false,
            ...overrides,
        });
    }
}

/**
 * 文章工厂
 */
export class ArticleFactory extends BaseFactory<any> {
    protected definition() {
        return {
            id: faker.string.uuid(),
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraphs(5),
            summary: faker.lorem.paragraph(),
            slug: faker.lorem.slug(),
            status: faker.helpers.arrayElement(['draft', 'published', 'archived']),
            featured: faker.datatype.boolean(),
            viewCount: faker.number.int({ min: 0, max: 10000 }),
            likeCount: faker.number.int({ min: 0, max: 1000 }),
            commentCount: faker.number.int({ min: 0, max: 100 }),
            publishedAt: faker.date.past(),
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
            authorId: faker.string.uuid(),
        };
    }

    /**
     * 创建已发布文章
     */
    createPublished(overrides: Partial<any> = {}) {
        return this.create({
            status: 'published',
            publishedAt: faker.date.past(),
            ...overrides,
        });
    }

    /**
     * 创建草稿文章
     */
    createDraft(overrides: Partial<any> = {}) {
        return this.create({
            status: 'draft',
            publishedAt: null,
            ...overrides,
        });
    }

    /**
     * 创建精选文章
     */
    createFeatured(overrides: Partial<any> = {}) {
        return this.create({
            featured: true,
            status: 'published',
            ...overrides,
        });
    }

    /**
     * 创建热门文章
     */
    createPopular(overrides: Partial<any> = {}) {
        return this.create({
            viewCount: faker.number.int({ min: 5000, max: 50000 }),
            likeCount: faker.number.int({ min: 500, max: 5000 }),
            commentCount: faker.number.int({ min: 50, max: 500 }),
            ...overrides,
        });
    }

    /**
     * 创建带作者的文章
     */
    createWithAuthor(author: any, overrides: Partial<any> = {}) {
        return this.create({
            authorId: author.id,
            author,
            ...overrides,
        });
    }
}

/**
 * 标签工厂
 */
export class TagFactory extends BaseFactory<any> {
    protected definition() {
        return {
            id: faker.string.uuid(),
            name: faker.lorem.word(),
            slug: faker.lorem.slug(),
            description: faker.lorem.sentence(),
            color: faker.internet.color(),
            articleCount: faker.number.int({ min: 0, max: 100 }),
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
        };
    }

    /**
     * 创建技术标签
     */
    createTechTag(overrides: Partial<any> = {}) {
        const techTags = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'Rust'];
        const name = faker.helpers.arrayElement(techTags);

        return this.create({
            name,
            slug: name.toLowerCase().replace('.', ''),
            description: `${name} programming language/framework`,
            ...overrides,
        });
    }

    /**
     * 创建热门标签
     */
    createPopularTag(overrides: Partial<any> = {}) {
        return this.create({
            articleCount: faker.number.int({ min: 50, max: 500 }),
            ...overrides,
        });
    }
}

/**
 * 评论工厂
 */
export class CommentFactory extends BaseFactory<any> {
    protected definition() {
        return {
            id: faker.string.uuid(),
            content: faker.lorem.paragraph(),
            status: faker.helpers.arrayElement(['approved', 'pending', 'rejected']),
            likeCount: faker.number.int({ min: 0, max: 100 }),
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
            authorId: faker.string.uuid(),
            articleId: faker.string.uuid(),
            parentId: null,
        };
    }

    /**
     * 创建已批准评论
     */
    createApproved(overrides: Partial<any> = {}) {
        return this.create({
            status: 'approved',
            ...overrides,
        });
    }

    /**
     * 创建待审核评论
     */
    createPending(overrides: Partial<any> = {}) {
        return this.create({
            status: 'pending',
            ...overrides,
        });
    }

    /**
     * 创建回复评论
     */
    createReply(parentComment: any, overrides: Partial<any> = {}) {
        return this.create({
            parentId: parentComment.id,
            articleId: parentComment.articleId,
            ...overrides,
        });
    }
}

/**
 * 移动端文档工厂
 */
export class MobileDocFactory extends BaseFactory<any> {
    protected definition() {
        return {
            id: faker.string.uuid(),
            title: faker.lorem.sentence(),
            summary: faker.lorem.paragraph(),
            content: faker.lorem.paragraphs(10),
            imageUrl: faker.image.url(),
            author: faker.person.fullName(),
            readTime: faker.number.int({ min: 1, max: 30 }),
            tags: faker.helpers.arrayElements(['frontend', 'backend', 'mobile', 'ai', 'devops'], { min: 1, max: 3 }),
            category: faker.helpers.arrayElement(['frontend', 'backend', 'mobile', 'ai', 'devops']),
            isHot: faker.datatype.boolean(),
            published: true,
            sortOrder: faker.number.int({ min: 0, max: 100 }),
            docType: 'article',
            filePath: faker.system.filePath(),
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
        };
    }

    /**
     * 创建前端文档
     */
    createFrontendDoc(overrides: Partial<any> = {}) {
        return this.create({
            category: 'frontend',
            tags: ['frontend', 'javascript', 'react'],
            ...overrides,
        });
    }

    /**
     * 创建后端文档
     */
    createBackendDoc(overrides: Partial<any> = {}) {
        return this.create({
            category: 'backend',
            tags: ['backend', 'nodejs', 'api'],
            ...overrides,
        });
    }

    /**
     * 创建热门文档
     */
    createHotDoc(overrides: Partial<any> = {}) {
        return this.create({
            isHot: true,
            readTime: faker.number.int({ min: 5, max: 15 }),
            ...overrides,
        });
    }
}

/**
 * 工厂管理器
 */
export class FactoryManager {
    private static instance: FactoryManager;

    public readonly user = new UserFactory();
    public readonly article = new ArticleFactory();
    public readonly tag = new TagFactory();
    public readonly comment = new CommentFactory();
    public readonly mobileDoc = new MobileDocFactory();

    private constructor() { }

    static getInstance(): FactoryManager {
        if (!FactoryManager.instance) {
            FactoryManager.instance = new FactoryManager();
        }
        return FactoryManager.instance;
    }

    /**
     * 重置 Faker 种子（用于可重复的测试）
     */
    setSeed(seed: number): void {
        faker.seed(seed);
    }

    /**
     * 创建完整的测试场景
     */
    createTestScenario() {
        // 创建用户
        const admin = this.user.createAdmin();
        const editor = this.user.createEditor();
        const users = this.user.createMany(5);

        // 创建标签
        const tags = this.tag.createMany(10);
        const techTags = [
            this.tag.createTechTag({ name: 'JavaScript' }),
            this.tag.createTechTag({ name: 'TypeScript' }),
            this.tag.createTechTag({ name: 'React' }),
            this.tag.createTechTag({ name: 'Node.js' }),
        ];

        // 创建文章
        const articles = [
            ...this.article.createMany(5, { authorId: editor.id }),
            ...this.article.createMany(10, { authorId: users[0].id }),
            this.article.createFeatured({ authorId: admin.id }),
            this.article.createPopular({ authorId: editor.id }),
        ];

        // 创建评论
        const comments = articles.flatMap(article =>
            this.comment.createMany(faker.number.int({ min: 0, max: 5 }), {
                articleId: article.id,
                authorId: faker.helpers.arrayElement([...users, editor]).id,
            })
        );

        // 创建移动端文档
        const mobileDocs = [
            ...this.mobileDoc.createMany(5),
            this.mobileDoc.createFrontendDoc(),
            this.mobileDoc.createBackendDoc(),
            this.mobileDoc.createHotDoc(),
        ];

        return {
            users: { admin, editor, users },
            tags: { all: [...tags, ...techTags], tech: techTags },
            articles,
            comments,
            mobileDocs,
        };
    }
}

// 导出工厂实例
export const factories = FactoryManager.getInstance();

// 导出单独的工厂类 (避免重复导出)
// export {
//     ArticleFactory, CommentFactory,
//     MobileDocFactory, TagFactory, UserFactory
// };

