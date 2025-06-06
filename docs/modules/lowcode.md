# 低代码平台模块

## 功能概述

低代码平台使用React + Vite开发，提供简易的可视化页面构建能力。

### 主要功能

- **画布系统**: 支持栅格布局和组件拖拽
- **组件库**: 提供基础UI组件和业务组件
- **属性面板**: 支持组件属性配置和样式调整
- **页面管理**: 保存、预览和发布页面
- **DSL编译**: 将页面配置转换为可运行的React代码
- **离线编辑**: 通过Service Worker实现断网状态下的编辑和同步能力
- **本地存储**: 使用IndexedDB保存编辑内容，防止意外数据丢失

## 路由设计

- `/` - 低代码平台首页（项目列表）
- `/editor/:id` - 页面编辑器
- `/preview/:id` - 页面预览
- `/publish/:id` - 页面发布配置

## 技术实现

- **拖拽系统**: 使用react-dnd实现拖拽交互
- **状态管理**: 使用zustand管理编辑器状态
- **属性编辑**: 基于JSON Schema自动生成属性编辑表单
- **代码编辑**: 使用Monaco Editor支持代码编辑
- **实时预览**: 使用动态组件加载实现实时预览
- **离线功能**: 基于Service Worker + IndexedDB实现完全离线操作能力
- **同步机制**: 实现断网编辑后的自动/手动同步策略

## 离线编辑技术详情

### Service Worker缓存策略

平台实现了四种缓存策略：

1. **组件资源**: 缓存优先，网络失败使用缓存
2. **核心脚本**: 缓存优先，保证编辑器可用
3. **API请求**: 网络优先，离线时使用降级响应
4. **普通资源**: 网络优先，失败回退到缓存

### 断网编辑工作流

1. 用户离线时继续编辑页面
2. 编辑操作保存到本地IndexedDB
3. 变更记录添加到同步队列
4. 网络恢复后自动/手动将队列同步到服务器

### 数据存储结构

IndexedDB中包含三个存储区：

- **designs**: 存储页面设计数据
- **components**: 缓存组件库数据
- **syncQueue**: 存储待同步的操作队列

## 核心概念

### 组件模型

每个组件包含以下信息：
- `type`: 组件类型标识
- `props`: 组件属性对象
- `children`: 子组件数组
- `style`: 样式对象
- `id`: 唯一标识

### DSL结构

页面DSL采用JSON格式：

```json
{
  "version": "1.0",
  "components": [{
    "id": "root",
    "type": "Container",
    "props": { "width": "100%" },
    "children": [...]
  }],
  "styles": {...},
  "metadata": {...}
}
```

## API接口

低代码平台调用以下后端接口：

- `GET /api/lowcode/pages` - 获取页面列表
- `GET /api/lowcode/pages/:id` - 获取页面配置
- `POST /api/lowcode/pages` - 创建页面
- `PUT /api/lowcode/pages/:id` - 更新页面
- `DELETE /api/lowcode/pages/:id` - 删除页面
- `POST /api/lowcode/publish/:id` - 发布页面

## 组件开发指南

### 组件结构

每个低代码组件需要实现以下结构：

1. **组件定义**：实现实际渲染逻辑的React组件
2. **配置描述**：定义组件的属性、样式、事件配置
3. **属性Schema**：生成属性面板的JSON Schema

例如，一个按钮组件的定义可能如下：

```tsx
// 组件定义
const Button = ({ text, onClick, ...props }) => (
  <button onClick={onClick} {...props}>{text}</button>
);

// 组件注册信息
export const ButtonConfig = {
  type: 'Button',
  name: '按钮',
  icon: 'button-icon',
  propSchema: {
    type: 'object',
    properties: {
      text: { type: 'string', title: '文本' },
      type: { 
        type: 'string', 
        title: '类型', 
        enum: ['primary', 'secondary', 'text'],
        enumNames: ['主要', '次要', '文本']
      }
    }
  },
  defaultProps: {
    text: '按钮',
    type: 'primary'
  }
};
```

### 注册新组件

注册组件需要将组件添加到组件注册表中：

```tsx
// 在 src/components/registry.ts 中
import { ButtonConfig } from './Button';
import { InputConfig } from './Input';

export const componentRegistry = [
  ButtonConfig,
  InputConfig,
  // 添加新组件配置
];
```

## 环境要求

- Node.js 16+
- npm 8+ 或 pnpm 7+
- 浏览器: Chrome 90+, Firefox 88+, Edge 90+
- **PWA支持**: 支持Service Worker的现代浏览器

## 详细启动流程

### 开发环境启动

1. **安装依赖**：
   ```bash
   cd /Users/huangyuming/Desktop/createProjects/AI-code
   pnpm install
   ```

2. **启动后端服务**：低代码平台依赖后端API，因此需要先启动服务端
   ```bash
   # 启动后端服务
   pnpm dev:server
   ```

3. **启动低代码平台**：
   ```bash
   # 启动低代码平台
   pnpm dev:lowcode
   
   # 或单独进入目录启动
   cd apps/lowcode
   pnpm dev
   ```

4. **访问应用**：
   浏览器访问 `http://localhost:3002` 即可打开低代码平台

### 配置说明

低代码平台的主要配置文件：

- `vite.config.ts` - Vite构建配置
- `.env.development` - 开发环境变量
- `.env.production` - 生产环境变量

关键配置项：

```
# API基础路径
VITE_API_BASE_URL=/api

# 资源公共路径
VITE_PUBLIC_PATH=/

# 是否启用Mock数据
VITE_USE_MOCK=false

# 组件注册模式 (dynamic/static)
VITE_COMPONENT_MODE=dynamic
```

## 打包和部署流程

### 构建应用

```bash
# 仅构建低代码平台
pnpm build:lowcode

# 构建所有应用
pnpm build
```

构建产物将生成在 `apps/lowcode/dist` 目录下。

### 静态部署

构建后的应用可以部署到任何静态服务器：

```bash
# 使用serve预览构建结果
npx serve -s apps/lowcode/dist

# 或使用nginx部署
# 将dist目录内容复制到nginx的html目录
cp -r apps/lowcode/dist/* /usr/share/nginx/html/
```

### Docker部署

1. **构建Docker镜像**：
   ```bash
   docker build -t lowcode-platform:latest -f apps/lowcode/Dockerfile .
   ```

2. **运行容器**：
   ```bash
   docker run -d -p 8080:80 lowcode-platform:latest
   ```

3. **使用Docker Compose**：
   ```bash
   # 启动所有服务
   docker-compose up -d
   
   # 仅启动低代码平台
   docker-compose up -d lowcode
   ```

## 与其他模块的集成

### 与后端服务集成

低代码平台通过API与后端服务通信，需确保：

1. 后端服务已正确启动并可访问。
2. 在 `.env.development` 或 `.env.production` 中配置了正确的 `VITE_API_BASE_URL`。
3. 认证令牌能够正确通过请求头传递，并在后端得到验证。

### 用户认证流程

低代码平台使用共享的Auth模块处理用户认证：

1. **登录流程**:
   - 用户访问受保护页面时检查认证状态
   - 未认证用户重定向到登录页面(`/login`)
   - 用户输入凭据(用户名/邮箱和密码)
   - 认证成功后获取JWT访问令牌
   - 访问令牌存储在localStorage，刷新令牌存储在HTTP-Only Cookie
   - 重定向回原始请求页面

2. **登录组件实现**:
   ```tsx
   // 登录页面核心逻辑
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!usernameOrEmail || !password) {
       toast.error('请填写完整信息');
       return;
     }
     
     setIsLoading(true);
     
     try {
       await login(usernameOrEmail, password);
       toast.success('登录成功');
       navigate(from, { replace: true });
     } catch (error) {
       console.error('Login failed:', error);
       toast.error('登录失败，请检查账号密码');
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. **导航栏登录状态处理**:
   ```tsx
   // 导航栏中的登录/登出按钮
   {isAuthenticated ? (
     <div className="flex items-center space-x-4">
       <span className="text-sm text-gray-700">
         欢迎，{user?.fullName || user?.username}
       </span>
       <button
         onClick={handleLogout}
         className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
       >
         退出登录
       </button>
     </div>
   ) : (
     <div className="flex items-center space-x-4">
       <Link to="/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
         登录
       </Link>
       <Link to="/register" className="bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium">
         注册
       </Link>
     </div>
   )}
   ```

4. **登出功能**:
   - 用户点击"退出登录"按钮
   - 清除本地存储的访问令牌
   - 向服务器发送登出请求，清除刷新令牌
   - 重定向到登录页或首页

### 页面权限控制

平台实现基于角色的页面访问控制：

1. **页面级保护**:
   ```tsx
   // 受保护路由组件
   const ProtectedRoute = ({ children }) => {
     const { isAuthenticated, isLoading } = useAuth();
     const location = useLocation();
     
     if (isLoading) {
       return <LoadingSpinner />;
     }
     
     if (!isAuthenticated) {
       return <Navigate to="/login" state={{ from: location }} replace />;
     }
     
     return children;
   };
   ```

2. **路由配置**:
   ```tsx
   <Routes>
     <Route path="/" element={<HomePage />} />
     <Route path="/login" element={<Login />} />
     <Route path="/register" element={<Register />} />
     
     {/* 受保护路由 */}
     <Route element={<ProtectedRoute />}>
       <Route path="/editor" element={<EditorPage />} />
       <Route path="/projects" element={<ProjectsPage />} />
       <Route path="/editor/:id" element={<EditorPage />} />
     </Route>
   </Routes>
   ```

## 扩展和定制

### 添加新组件类型

1. 在 `src/components/LowCodeComponents` 下创建新组件
2. 实现组件渲染逻辑和配置描述
3. 在组件注册表中注册新组件
4. 重新构建应用

### 自定义主题

1. 修改 `src/styles/theme.css` 文件中的CSS变量
2. 或在 `tailwind.config.js` 中扩展主题配置

### 添加新功能模块

1. 在 `src/features` 下创建新功能模块
2. 在路由配置中添加新页面
3. 更新导航和菜单结构

### 集成自定义数据源

1.  **定义数据源接口**: 在 `src/services` 中创建新的服务来处理与自定义数据源的交互。
2.  **开发数据连接器**: 实现从自定义数据源（如第三方API、数据库视图等）获取数据的逻辑。
3.  **创建数据绑定组件**: 开发新的低代码组件或扩展现有组件，使其能够连接到新的数据源并展示数据。
4.  **更新属性面板**: 为数据绑定组件添加配置项，允许用户选择数据源、配置查询参数等。
5.  **状态管理**: 如果需要，在Zustand store中管理数据源的状态和缓存。

### 扩展编辑器功能

1.  **自定义右键菜单**: 为画布或组件添加自定义的右键操作。
2.  **插件系统**: (高级) 设计一个插件系统，允许动态加载和注册新的编辑器功能或组件。
3.  **增强校验规则**: 为组件属性添加更复杂的校验逻辑。

## 常见问题排查

1. **组件拖拽不生效**：
   - 检查react-dnd相关配置
   - 确认组件已正确注册
   - 查看浏览器控制台是否有错误

2. **属性面板无法编辑**：
   - 检查组件的propSchema定义
   - 确认选中了正确的组件

3. **预览功能不正常**：
   - 检查DSL结构是否正确
   - 确认所有引用的组件都已注册
   - 查看网络请求是否正常

4. **与服务端通信失败**：
   - 检查API基础路径配置
   - 确认后端服务已启动
   - 检查认证状态和令牌

## 新增功能问题排查

### 离线功能相关问题

1.  **Service Worker未注册成功**
   - 检查控制台是否有Service Worker注册错误
   - 确认浏览器支持Service Worker API
   - 检查网站是否通过HTTPS或localhost访问

2.  **离线时无法编辑或资源加载失败**
   - 确认Service Worker状态是否为"activated"
   - 验证核心资源是否已缓存
   - 检查IndexedDB权限和配额
   - 检查Service Worker的 `install` 和 `activate` 事件是否成功完成，以及 `fetch` 事件拦截器是否按预期工作。
   - 使用浏览器开发者工具（Application -> Cache Storage）检查核心资源是否已成功缓存。
3.  **网络恢复后未自动同步或同步失败**
   - 检查同步队列中是否有待同步记录
   - 验证"online"事件监听是否正常工作
   - 尝试手动触发同步
   - 检查开发者工具控制台是否有同步相关的错误日志。
   - 确认后端API在网络恢复后是否可达且正常响应。
   - 检查 `IndexedDB` (Application -> IndexedDB -> syncQueue) 中的同步队列是否有积压或错误标记。
4.  **数据冲突**
    -   **问题**: 多端同时离线编辑后，在线同步时可能发生数据冲突。
    -   **解决**:
        -   实现简单的冲突解决策略（如“最后写入者获胜”）。
        -   （高级）提供用户界面让用户选择如何合并冲突。
        -   在同步请求中加入版本号或时间戳，帮助服务器端检测和处理冲突。
5.  **缓存更新问题**
    -   **问题**: 应用代码或静态资源更新后，用户仍然看到旧版本。
    -   **解决**:
        -   确保Service Worker脚本本身在更新时能够被浏览器正确获取和激活新版本。
        -   在Service Worker的 `activate` 事件中清理旧缓存。
        -   提供一个“强制刷新”或“清除缓存并更新”的按钮给用户。
        -   修改Service Worker中的 `CACHE_NAME` 版本号以强制更新所有缓存资源。
