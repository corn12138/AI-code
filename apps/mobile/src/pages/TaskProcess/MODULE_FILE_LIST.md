# TaskProcess 模块完整文件清单

## 📋 **模块迁移文件清单**

以下是 TaskProcess 模块迁移到内网项目所需的完整文件列表：

**图例说明**：
- ✅ **必需文件** - 核心功能必须的文件
- 🔶 **推荐文件** - 增强功能和用户体验的文件  
- 📄 **文档文件** - 开发和维护参考文档
- 🔧 **配置文件** - 环境和构建配置

---

## 📁 **1. 页面组件文件**

### 🗂️ **任务列表页面**
```
src/pages/TaskProcess/TaskList/
├── index.tsx                    # ✅ 任务列表主组件
├── index.css                    # ✅ 任务列表样式（含现代化CSS变量）
├── index.ts                     # ✅ 导出文件
├── ModernTaskList.tsx           # 📄 现代化任务列表组件（备用参考）
└── ModernTaskList.css           # 📄 现代化样式（备用参考）
```

### 🗂️ **任务详情页面**
```
src/pages/TaskProcess/TaskDetail/
├── index.tsx                    # ✅ 任务详情主组件
├── index.css                    # ✅ 任务详情样式（含响应式适配）
├── index.ts                     # ✅ 导出文件
└── components/                  # ✅ 详情页子组件目录
    ├── index.ts                 # ✅ 子组件导出
    ├── TaskInfo.tsx             # ✅ 报告信息组件
    ├── TaskInfo.css             # ✅ 报告信息样式
    ├── ProcessRecord.tsx        # ✅ 流程记录组件
    ├── ProcessRecord.css        # ✅ 流程记录样式
    ├── ProcessPanel.tsx         # ✅ 流程处理组件
    └── ProcessPanel.css         # ✅ 流程处理样式
```

### 🗂️ **文件列表页面**
```
src/pages/TaskProcess/FileList/
├── index.tsx                    # ✅ 文件列表主组件
└── index.css                    # ✅ 文件列表样式（含平板适配修复）
```

---

## 📁 **2. 状态管理文件**

### 🗂️ **状态管理核心**
```
# 方案一：Context版本（推荐）
src/stores/
└── taskProcessStore.ts          # ✅ 任务处理状态管理（Context版本）

# 方案二：Hook版本（可选）
src/stores/taskProcess/
├── types.ts                     # 🔶 TypeScript 类型定义
└── useTaskProcessStore.ts       # 🔶 任务处理状态管理 Hook

注意：两种方案选择其一即可，推荐使用Context版本
```

---

## 📁 **3. API 接口文件**

### 🗂️ **接口定义**
```
src/api/taskProcess/
└── index.ts                     # ✅ 任务处理相关接口定义（需根据实际后端调整）

注意：当前为模拟数据，迁移时需要替换为实际API调用
```

---

## 📁 **4. 样式文件**

### 🗂️ **全局样式**
```
src/styles/
├── taskProcess.css              # 任务处理模块全局样式和响应式适配
├── antd-mobile.css              # Ant Design Mobile 主题定制
└── device-specific.css          # 设备特定样式
```

### 🗂️ **模块内样式**
```
src/pages/TaskProcess/
├── modern-responsive.css        # 现代响应式样式（备用）
├── CSS_COMPARISON.md            # 样式对比文档
├── CSS_RESTORE_SUMMARY.md       # 样式恢复总结
├── RESPONSIVE_COMPATIBILITY_SUMMARY.md  # 响应式兼容总结
├── FILE_LIST_FIX_SUMMARY.md     # 文件列表修复总结
└── OPTIMIZATION_SUMMARY.md      # 优化总结文档
```

---

## 📁 **5. 路由配置**

### 🗂️ **路由文件**
```
src/router/
└── routes.ts                    # 路由配置（需添加 TaskProcess 相关路由）
```

### 🔗 **需要添加的路由配置**：
```typescript
// 在 routes.ts 中添加以下路由：
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
}
```

---

## 📁 **6. Hook 文件**

### 🗂️ **自定义 Hook**
```
src/hooks/
├── useTaskProcess.ts            # 任务处理相关 Hook
├── useResponsiveDesign.ts       # 响应式设计 Hook
├── useFormValidation.ts         # 表单验证 Hook
└── index.ts                     # Hook 导出文件
```

---

## 📁 **7. 类型定义文件**

### 🗂️ **TypeScript 类型**
```
src/types/
└── index.ts                     # 全局类型定义

src/stores/taskProcess/
└── types.ts                     # 任务处理模块类型定义
```

---

## 📁 **8. 工具函数文件**

### 🗂️ **工具函数**
```
src/utils/
├── index.ts                     # 工具函数导出
├── deviceDetector.ts            # 设备检测工具
├── networkManager.ts            # 网络管理工具
└── nativeBridge.ts              # 原生桥接工具
```

---

## 📁 **9. 配置文件**

### 🗂️ **环境配置**
```
src/config/
└── env.ts                       # 环境配置文件
```

---

## 📁 **10. 服务文件**

### 🗂️ **API 服务**
```
src/services/
└── api.ts                       # API 服务配置
```

---

## 📁 **11. 文档文件**

### 🗂️ **模块文档**
```
src/pages/TaskProcess/
├── API_INTEGRATION_GUIDE.md     # 接口集成指南
├── MODULE_FILE_LIST.md          # 模块文件清单（本文件）
├── CSS_COMPARISON.md            # 样式对比文档
├── CSS_RESTORE_SUMMARY.md       # 样式恢复总结
├── RESPONSIVE_COMPATIBILITY_SUMMARY.md  # 响应式兼容总结
├── FILE_LIST_FIX_SUMMARY.md     # 文件列表修复总结
└── OPTIMIZATION_SUMMARY.md      # 优化总结文档
```

---

## 📦 **依赖包清单**

### 🔧 **核心依赖**
```json
{
    "antd-mobile": "^5.x.x",
    "antd-mobile-icons": "^0.x.x",
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "umi": "^4.x.x"
}
```

### 🔧 **开发依赖**
```json
{
    "@types/react": "^18.x.x",
    "@types/react-dom": "^18.x.x",
    "typescript": "^5.x.x"
}
```

---

## 🚀 **迁移步骤指南**

### **第一步：复制核心文件**
1. 复制 `src/pages/TaskProcess/` 整个目录
2. 复制 `src/stores/taskProcess/` 和 `src/stores/taskProcessStore.ts`
3. 复制 `src/api/taskProcess/` 目录

### **第二步：复制样式文件**
1. 复制 `src/styles/taskProcess.css`
2. 复制各页面组件的 `.css` 文件
3. 检查 `src/styles/antd-mobile.css` 主题定制

### **第三步：配置路由**
1. 在 `src/router/routes.ts` 中添加 TaskProcess 路由
2. 确保路由路径与组件路径匹配

### **第四步：安装依赖**
1. 确保安装了 `antd-mobile` 和 `antd-mobile-icons`
2. 检查 React 和 TypeScript 版本兼容性

### **第五步：配置接口**
1. 根据 `API_INTEGRATION_GUIDE.md` 配置实际接口地址
2. 替换模拟数据为真实接口调用
3. 调整数据格式适配

### **第六步：测试验证**
1. 测试任务列表页面加载
2. 测试任务详情页面跳转和数据显示
3. 测试流程处理功能
4. 测试文件列表页面
5. 测试响应式兼容性

---

## ⚠️ **注意事项**

### **🔍 环境适配**
- 检查内网项目的构建工具配置（Webpack/Vite）
- 确保 CSS 预处理器支持
- 验证 TypeScript 配置兼容性

### **🔗 依赖冲突**
- 检查 Ant Design Mobile 版本兼容性
- 确保 React Router 版本匹配
- 验证状态管理方案兼容性

### **🎨 样式适配**
- 检查 CSS 变量支持
- 验证响应式断点设置
- 确保设备特定样式生效

### **🔌 接口适配**
- 根据实际后端接口调整数据格式
- 配置正确的接口域名和路径
- 实现错误处理和用户反馈

### **📱 功能验证**
- 测试所有页面跳转逻辑
- 验证状态管理数据流转
- 确保表单验证和提交功能
- 测试文件上传下载功能

---

## 📞 **技术支持**

如果在迁移过程中遇到问题，可以参考以下文档：
- `API_INTEGRATION_GUIDE.md` - 接口集成详细说明
- `RESPONSIVE_COMPATIBILITY_SUMMARY.md` - 响应式适配说明  
- `OPTIMIZATION_SUMMARY.md` - 性能优化建议

或者检查各组件的注释和 TODO 标记，了解具体的实现细节和注意事项。
