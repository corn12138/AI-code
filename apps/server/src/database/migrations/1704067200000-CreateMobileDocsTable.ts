import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMobileDocsTable1704067200000 implements MigrationInterface {
    name = 'CreateMobileDocsTable1704067200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建枚举类型
        await queryRunner.query(`
            CREATE TYPE "doc_category_enum" AS ENUM(
                'latest', 
                'frontend', 
                'backend', 
                'ai', 
                'mobile', 
                'design'
            )
        `);

        // 创建 mobile_docs 表
        await queryRunner.createTable(
            new Table({
                name: 'mobile_docs',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '200',
                        isNullable: false,
                    },
                    {
                        name: 'summary',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'content',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'category',
                        type: 'doc_category_enum',
                        default: "'latest'",
                        isNullable: false,
                    },
                    {
                        name: 'author',
                        type: 'varchar',
                        length: '100',
                        default: "'系统管理员'",
                        isNullable: false,
                    },
                    {
                        name: 'readTime',
                        type: 'integer',
                        default: 5,
                        isNullable: false,
                    },
                    {
                        name: 'tags',
                        type: 'jsonb',
                        default: "'[]'",
                        isNullable: false,
                    },
                    {
                        name: 'imageUrl',
                        type: 'varchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'isHot',
                        type: 'boolean',
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: 'published',
                        type: 'boolean',
                        default: true,
                        isNullable: false,
                    },
                    {
                        name: 'sortOrder',
                        type: 'integer',
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: 'docType',
                        type: 'varchar',
                        length: '50',
                        default: "'markdown'",
                        isNullable: false,
                    },
                    {
                        name: 'filePath',
                        type: 'varchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // 创建索引
        await queryRunner.query(`
            CREATE INDEX IDX_mobile_docs_category ON mobile_docs (category)
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_mobile_docs_published ON mobile_docs (published)
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_mobile_docs_isHot ON mobile_docs ("isHot")
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_mobile_docs_sortOrder ON mobile_docs ("sortOrder")
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_mobile_docs_createdAt ON mobile_docs ("createdAt")
        `);

        // 创建复合索引
        await queryRunner.query(`
            CREATE INDEX IDX_mobile_docs_category_published ON mobile_docs (category, published)
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_mobile_docs_published_isHot_sortOrder ON mobile_docs (published, "isHot", "sortOrder")
        `);

        // 创建全文搜索索引
        await queryRunner.query(`
            CREATE INDEX IDX_mobile_docs_fulltext 
            ON mobile_docs 
            USING gin(to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || content))
        `);

        // 创建标签GIN索引
        await queryRunner.query(`
            CREATE INDEX IDX_mobile_docs_tags_gin 
            ON mobile_docs 
            USING gin(tags)
        `);

        // 创建文件路径唯一索引
        await queryRunner.query(`
            CREATE UNIQUE INDEX IDX_mobile_docs_filePath_unique 
            ON mobile_docs ("filePath") 
            WHERE "filePath" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除索引
        await queryRunner.query(`DROP INDEX IF EXISTS IDX_mobile_docs_filePath_unique`);
        await queryRunner.query(`DROP INDEX IF EXISTS IDX_mobile_docs_tags_gin`);
        await queryRunner.query(`DROP INDEX IF EXISTS IDX_mobile_docs_fulltext`);
        await queryRunner.query(`DROP INDEX IF EXISTS IDX_mobile_docs_published_isHot_sortOrder`);
        await queryRunner.query(`DROP INDEX IF EXISTS IDX_mobile_docs_category_published`);
        await queryRunner.query(`DROP INDEX IF EXISTS IDX_mobile_docs_createdAt`);
        await queryRunner.query(`DROP INDEX IF EXISTS IDX_mobile_docs_sortOrder`);
        await queryRunner.query(`DROP INDEX IF EXISTS IDX_mobile_docs_isHot`);
        await queryRunner.query(`DROP INDEX IF EXISTS IDX_mobile_docs_published`);
        await queryRunner.query(`DROP INDEX IF EXISTS IDX_mobile_docs_category`);

        // 删除表
        await queryRunner.dropTable('mobile_docs');

        // 删除枚举类型
        await queryRunner.query(`DROP TYPE IF EXISTS "doc_category_enum"`);
    }
}
