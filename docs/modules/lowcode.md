# 低代码平台模块

## 功能概述

低代码平台使用React + Vite开发，提供简易的可视化页面构建能力。

### 主要功能

- **画布系统**: 支持栅格布局和组件拖拽
- **组件库**: 提供基础UI组件和业务组件
- **属性面板**: 支持组件属性配置和样式调整
- **页面管理**: 保存、预览和发布页面
- **DSL编译**: 将页面配置转换为可运行的React代码

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

1. 后端服务已正确启动
2. 配置了正确的API基础路径
3. 认证令牌能够正确传递和验证

### 用户认证流程

低代码平台使用共享的Auth模块处理用户认证：

1. 用户访问平台时，检查本地存储的认证令牌
2. 如果令牌不存在或已过期，重定向到登录页面
3. 登录成功后，保存令牌并重定向回原始页面
4. API请求时自动附加认证令牌

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
