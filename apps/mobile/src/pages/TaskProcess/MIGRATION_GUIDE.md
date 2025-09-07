# TaskProcess模块内网项目迁移完整指南

## 🎯 **迁移目标**
将TaskProcess模块完整迁移到内网项目，确保所有功能正常运行，包括任务列表、详情页面、流程处理和文件管理。

---

## 📋 **必需文件清单**

### **🔥 核心必需文件（必须复制）**

#### **1. 页面组件文件**
```bash
# 任务列表页面
src/pages/TaskProcess/TaskList/
├── index.tsx                    # ✅ 必需 - 主组件
├── index.css                    # ✅ 必需 - 样式文件
└── index.ts                     # ✅ 必需 - 导出文件

# 任务详情页面
src/pages/TaskProcess/TaskDetail/
├── index.tsx                    # ✅ 必需 - 主组件
├── index.css                    # ✅ 必需 - 样式文件
├── index.ts                     # ✅ 必需 - 导出文件
└── components/                  # ✅ 必需 - 子组件目录
    ├── index.ts                 # ✅ 必需 - 子组件导出
    ├── TaskInfo.tsx             # ✅ 必需 - 报告信息组件
    ├── TaskInfo.css             # ✅ 必需 - 报告信息样式
    ├── ProcessRecord.tsx        # ✅ 必需 - 流程记录组件
    ├── ProcessRecord.css        # ✅ 必需 - 流程记录样式
    ├── ProcessPanel.tsx         # ✅ 必需 - 流程处理组件
    └── ProcessPanel.css         # ✅ 必需 - 流程处理样式

# 文件列表页面
src/pages/TaskProcess/FileList/
├── index.tsx                    # ✅ 必需 - 主组件
└── index.css                    # ✅ 必需 - 样式文件
```

#### **2. 状态管理文件**
```bash
# Context版本状态管理（推荐）
src/stores/
└── taskProcessStore.ts          # ✅ 必需 - 状态管理核心

# 或者 Hook版本状态管理
src/stores/taskProcess/
├── types.ts                     # ✅ 必需 - 类型定义
└── useTaskProcessStore.ts       # ✅ 必需 - Hook状态管理
```

#### **3. 样式系统文件**
```bash
# 全局样式系统
src/styles/
└── taskProcess.css              # ✅ 必需 - CSS变量系统和全局样式

# 主题定制（如果使用）
src/styles/
├── antd-mobile.css              # 🔶 可选 - Ant Design Mobile主题
└── device-specific.css          # 🔶 可选 - 设备特定样式
```

#### **4. 类型定义文件**
```bash
src/types/
└── index.ts                     # ✅ 必需 - 全局类型定义（需添加TaskProcess相关类型）
```

---

## 📦 **依赖包要求**

### **🔧 必需依赖**
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "antd-mobile": "^5.32.0",
    "antd-mobile-icons": "^0.3.0",
    "umi": "^4.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

### **🔧 安装命令**
```bash
# 使用npm
npm install antd-mobile antd-mobile-icons

# 使用yarn
yarn add antd-mobile antd-mobile-icons

# 使用pnpm
pnpm add antd-mobile antd-mobile-icons
```

---

## 🚀 **详细迁移步骤**

### **第一步：环境准备**

#### **1.1 检查项目环境**
```bash
# 检查Node.js版本（建议16+）
node --version

# 检查包管理器
npm --version  # 或 yarn --version 或 pnpm --version

# 检查React版本
npm list react react-dom
```

#### **1.2 安装必需依赖**
```bash
# 安装Ant Design Mobile
npm install antd-mobile@^5.32.0 antd-mobile-icons@^0.3.0

# 如果使用TypeScript，确保类型定义
npm install --save-dev @types/react @types/react-dom
```

### **第二步：文件复制**

#### **2.1 复制页面组件**
```bash
# 复制整个TaskProcess目录到目标项目
cp -r src/pages/TaskProcess/ <目标项目>/src/pages/

# 或者手动复制以下文件：
# - TaskList/index.tsx, index.css, index.ts
# - TaskDetail/index.tsx, index.css, index.ts
# - TaskDetail/components/ 整个目录
# - FileList/index.tsx, index.css
```

#### **2.2 复制状态管理**
```bash
# 复制状态管理文件
cp src/stores/taskProcessStore.ts <目标项目>/src/stores/

# 如果使用Hook版本
cp -r src/stores/taskProcess/ <目标项目>/src/stores/
```

#### **2.3 复制样式系统**
```bash
# 复制CSS变量系统（必需）
cp src/styles/taskProcess.css <目标项目>/src/styles/

# 复制主题文件（可选）
cp src/styles/antd-mobile.css <目标项目>/src/styles/
cp src/styles/device-specific.css <目标项目>/src/styles/
```

### **第三步：配置集成**

#### **3.1 路由配置**
在目标项目的路由文件中添加：

```typescript
// routes.ts 或 router/index.ts
export const routes = [
  // ... 其他路由
  {
    path: '/task-process',
    component: '@/pages/TaskProcess/TaskList',
    exact: true,
  },
  {
    path: '/task-process/detail/:id',
    component: '@/pages/TaskProcess/TaskDetail',
  },
  {
    path: '/task-process/files',
    component: '@/pages/TaskProcess/FileList',
  },
];
```

#### **3.2 样式导入**
在主样式文件或入口文件中导入：

```css
/* app.css 或 global.css */
@import './styles/taskProcess.css';

/* 可选的主题定制 */
@import './styles/antd-mobile.css';
@import './styles/device-specific.css';
```

#### **3.3 状态管理集成**
在App组件中包装Provider：

```tsx
// App.tsx
import { TaskProcessProvider } from '@/stores/taskProcessStore';

function App() {
  return (
    <TaskProcessProvider>
      {/* 其他组件 */}
    </TaskProcessProvider>
  );
}
```

### **第四步：类型定义更新**

#### **4.1 添加TaskProcess类型**
在 `src/types/index.ts` 中添加：

```typescript
// TaskProcess相关类型定义
export interface TaskItem {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  deadline: string;
  department: string;
  initiator: string;
  createTime: string;
}

export interface TaskDetail extends TaskItem {
  content: string;
  attachments: FileItem[];
  processRecords: ProcessRecord[];
  nextSteps: NextStep[];
  nextOrgs: NextOrg[];
  informedPersons: InformedPerson[];
}

export interface ProcessRecord {
  id: string;
  stepName: string;
  handlerName: string;
  handlerId: string;
  department: string;
  handleTime: string;
  opinion: string;
  status: 'completed' | 'current' | 'pending';
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadTime: string;
}

// ... 其他类型定义
```

### **第五步：API接口配置**

#### **5.1 创建API服务文件**
```typescript
// src/api/taskProcess.ts
export const taskProcessAPI = {
  // 获取任务列表
  getTaskList: (params: any) => {
    return request('/api/task-process/list', {
      method: 'GET',
      params,
    });
  },

  // 获取任务详情
  getTaskDetail: (id: string) => {
    return request(`/api/task-process/detail/${id}`, {
      method: 'GET',
    });
  },

  // 提交流程处理
  submitProcess: (data: any) => {
    return request('/api/task-process/submit', {
      method: 'POST',
      data,
    });
  },

  // 获取下一步处理选项
  getNextSteps: (stepId: string) => {
    return request(`/api/task-process/next-steps/${stepId}`, {
      method: 'GET',
    });
  },

  // 获取处理机构列表
  getNextOrgs: (stepId: string) => {
    return request(`/api/task-process/next-orgs/${stepId}`, {
      method: 'GET',
    });
  },

  // 获取知悉人列表
  getInformedPersons: (stepId: string) => {
    return request(`/api/task-process/informed-persons/${stepId}`, {
      method: 'GET',
    });
  },
};
```

#### **5.2 更新组件中的API调用**
将组件中的模拟数据替换为真实API调用：

```typescript
// TaskList/index.tsx 中
import { taskProcessAPI } from '@/api/taskProcess';

// 替换模拟数据加载
const loadTasks = async () => {
  try {
    const response = await taskProcessAPI.getTaskList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: activeTab,
    });
    setTasks(response.data.list);
    setPagination({
      ...pagination,
      total: response.data.total,
    });
  } catch (error) {
    console.error('加载任务列表失败:', error);
  }
};
```

### **第六步：构建配置**

#### **6.1 Webpack配置（如果需要）**
```javascript
// webpack.config.js
module.exports = {
  // ... 其他配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
```

#### **6.2 TypeScript配置**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

---

## 🧪 **测试验证清单**

### **功能测试**
- [ ] 任务列表页面正常加载
- [ ] 任务列表分页功能正常
- [ ] 任务详情页面跳转正常
- [ ] 报告信息显示正确
- [ ] 流程记录展示正常
- [ ] 流程处理表单功能正常
- [ ] 文件列表页面正常
- [ ] 文件选择和操作功能正常

### **样式测试**
- [ ] 移动端响应式布局正常
- [ ] 平板端显示效果正确
- [ ] 大字体模式适配正常
- [ ] 暗色模式兼容（如果支持）
- [ ] 各种屏幕尺寸适配正常

### **兼容性测试**
- [ ] iOS Safari浏览器正常
- [ ] Android Chrome浏览器正常
- [ ] 微信内置浏览器正常
- [ ] 各种设备分辨率适配

---

## ⚠️ **常见问题和解决方案**

### **问题1：样式不生效**
**原因**：CSS变量系统未正确导入
**解决**：确保在入口文件中导入 `taskProcess.css`

### **问题2：路由跳转失败**
**原因**：路由配置不正确或路径不匹配
**解决**：检查路由配置和组件路径是否一致

### **问题3：状态管理报错**
**原因**：Provider未正确包装或Context使用错误
**解决**：确保App组件被TaskProcessProvider包装

### **问题4：API接口调用失败**
**原因**：接口地址不正确或跨域问题
**解决**：配置正确的接口地址和代理设置

### **问题5：TypeScript类型错误**
**原因**：类型定义不完整或版本不兼容
**解决**：补充类型定义或更新依赖版本

---

## 📞 **技术支持**

### **文档参考**
- `API_INTEGRATION_GUIDE.md` - API集成详细说明
- `CSS_MODERNIZATION_SUMMARY.md` - CSS现代化改造说明
- `RESPONSIVE_COMPATIBILITY_SUMMARY.md` - 响应式兼容说明

### **调试建议**
1. 使用浏览器开发者工具检查网络请求
2. 查看控制台错误信息
3. 检查React DevTools中的组件状态
4. 验证CSS样式是否正确加载

### **性能优化**
1. 使用React.memo优化组件渲染
2. 实现虚拟滚动优化长列表
3. 使用懒加载优化图片和文件
4. 配置合适的缓存策略

---

## 🎉 **迁移完成验证**

当以下所有项目都通过验证时，表示迁移成功：

✅ **基础功能**
- 页面正常加载和跳转
- 数据正确显示和交互
- 表单提交和验证正常

✅ **用户体验**
- 响应式布局适配各种设备
- 加载状态和错误处理完善
- 操作反馈及时准确

✅ **技术指标**
- 无控制台错误和警告
- 页面加载速度满足要求
- 内存使用合理无泄漏

恭喜！您已成功将TaskProcess模块迁移到内网项目！🎊
