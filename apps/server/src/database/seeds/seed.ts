// 使用bcryptjs代替bcrypt，因为bcryptjs是纯JavaScript实现，没有本地依赖
import * as bcryptjs from 'bcryptjs';
import { Category } from '../../article/entities/category.entity';
import { Tag } from '../../article/entities/tag.entity';
import { User } from '../../user/entities/user.entity';
import dataSource from '../migrations/config';

async function seed() {
    console.log('开始填充种子数据...');

    try {
        await dataSource.initialize();
        console.log('数据库连接已初始化');

        // 添加默认管理员用户
        // 使用bcryptjs而不是bcrypt
        const hashedPassword = await bcryptjs.hash('Admin@123', 12); // 使用bcryptjs进行密码哈希
        // 创建管理员用户
        const adminUser = new User();
        adminUser.username = 'admin';
        adminUser.email = 'admin@example.com';
        adminUser.password = hashedPassword;
        adminUser.fullName = '系统管理员';
        adminUser.roles = ['admin', 'user'];

        // 检查是否已存在
        const existingAdmin = await dataSource.getRepository(User).findOne({
            where: { email: adminUser.email }
        });

        if (!existingAdmin) {
            await dataSource.getRepository(User).save(adminUser);
            console.log('已创建管理员用户');
        } else {
            console.log('管理员用户已存在，跳过创建');
        }

        // 添加默认分类
        const defaultCategories = [
            { name: '技术', description: '技术相关文章', slug: 'tech' },
            { name: '设计', description: '设计相关文章', slug: 'design' },
            { name: '产品', description: '产品相关文章', slug: 'product' },
            { name: '运营', description: '运营相关文章', slug: 'operation' }
        ];

        for (const categoryData of defaultCategories) {
            const existing = await dataSource.getRepository(Category).findOne({
                where: { name: categoryData.name }
            });

            if (!existing) {
                const category = new Category();
                Object.assign(category, categoryData);
                await dataSource.getRepository(Category).save(category);
                console.log(`已创建分类: ${categoryData.name}`);
            }
        }

        // 添加默认标签
        const defaultTags = [
            'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
            'NestJS', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS',
            'UI/UX', 'CSS', 'HTML', '产品设计', '用户体验', '低代码平台'
        ];

        for (const tagName of defaultTags) {
            const existing = await dataSource.getRepository(Tag).findOne({
                where: { name: tagName }
            });

            if (!existing) {
                const tag = new Tag();
                tag.name = tagName;
                await dataSource.getRepository(Tag).save(tag);
                console.log(`已创建标签: ${tagName}`);
            }
        }

        console.log('种子数据填充完成');
    } catch (error) {
        console.error('填充种子数据时出错:', error);
    } finally {
        await dataSource.destroy();
        console.log('数据库连接已关闭');
    }
}

seed();
