# 代码规范

本文档定义了博客与低代码平台项目的代码规范和最佳实践。

## TypeScript规范

- 使用TypeScript严格模式（strict: true）
- 优先使用接口（interface）定义对象结构
- 导出类型和接口时使用命名导出
- 避免使用`any`类型，优先使用泛型或明确类型

```typescript
// 推荐
interface UserData {
  id: string;
  name: string;
  email: string;
}

// 不推荐
type UserData = {
  id: string;
  name: string;
  email: string;
}

// 不推荐
const fetchUser = (id: any): any => { ... }

// 推荐
const fetchUser = (id: string): Promise<UserData> => { ... }
```

## React规范

- 使用函数组件和Hooks而非类组件
- 将Props类型定义为接口
- 导出组件使用命名导出
- 将大型组件拆分为小型组件
- 使用React.FC类型注解函数组件

```tsx
// 推荐
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ text, onClick, disabled }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {text}
    </button>
  );
};

// 不推荐
export default function Button(props) {
  return (
    <button 
      onClick={props.onClick} 
      disabled={props.disabled}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {props.text}
    </button>
  );
}
```

## NestJS规范

- 使用装饰器定义控制器、服务、模块等
- 始终为依赖项定义接口和类型
- 使用DTO（数据传输对象）进行数据验证
- 遵循依赖注入模式
- 使用异常过滤器处理错误

```typescript
// 推荐
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}
}

// 不推荐
@Injectable()
export class UserService {
  constructor(private usersRepository, private configService) {}
}
```

## 状态管理规范

- 使用Zustand进行状态管理
- 将状态逻辑封装在独立的store中
- 使用selector减少不必要的重渲染
- 为store定义良好的类型接口

```typescript
// 推荐
interface EditorStore {
  components: ComponentModel[];
  selectedId: string | null;
  selectComponent: (id: string | null) => void;
}

const useEditorStore = create<EditorStore>((set) => ({
  components: [],
  selectedId: null,
  selectComponent: (id) => set({ selectedId: id }),
}));

// 组件中使用
const selectedId = useEditorStore((state) => state.selectedId);
```

## CSS规范

- 使用Tailwind CSS实用类优先
- 自定义类名使用kebab-case
- 避免使用内联样式，除非必要
- 保持类名简短但描述性强

```tsx
// 推荐
<div className="flex items-center justify-between p-4 bg-white shadow rounded">

// 不推荐
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
```

## 安全最佳实践

- 净化所有用户输入以防XSS攻击
- 验证所有API请求参数
- 使用HTTPS请求
- 处理敏感数据时遵循隐私规范

```typescript
// 推荐
const sanitizedContent = DOMPurify.sanitize(userInput);

// 不推荐
element.innerHTML = userInput;
```

## 命名约定

- **文件名**: 使用kebab-case（如`user-profile.tsx`）
- **组件名**: 使用PascalCase（如`UserProfile`）
- **接口名**: 使用PascalCase，通常不加前缀（如`UserData`而非`IUserData`）
- **类型名**: 使用PascalCase（如`ButtonType`）
- **函数名**: 使用camelCase（如`getUserData`）
- **常量**: 使用UPPER_SNAKE_CASE（如`API_URL`）
- **变量**: 使用camelCase（如`userData`）

## 注释规范

- 为公共API和复杂逻辑添加JSDoc注释
- 避免冗余注释
- 简洁明了地解释"为什么"而不是"是什么"

```typescript
/**
 * 安全地渲染用户提供的HTML内容
 * @param content - 用户提供的原始HTML内容
 * @returns React组件，包含安全净化后的HTML
 */
const SafeHtml: React.FC<{ content: string }> = ({ content }) => {
  // 在渲染前净化内容防止XSS攻击
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

## Git提交规范

使用约定式提交（Conventional Commits）规范：

- feat: 新功能
- fix: 修复错误
- docs: 文档更新
- style: 样式更改
- refactor: 代码重构
- test: 添加测试
- chore: 构建过程或辅助工具变动

```
feat(blog): 添加文章编辑器组件
fix(api): 修复用户认证错误处理
docs(readme): 更新安装说明
```
