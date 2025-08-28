# 第一阶段：组件映射与基础设施

本文档记录在低代码平台引入 Taro 多端的第一阶段落地：组件映射、注册机制与使用方式。

## 目标
- 建立跨平台组件映射表（MUI/自有组件 → Taro 组件）
- 提供运行期注册 API，支持按平台覆盖/扩展映射
- 为后续 AST 生成与代码生成打基础

## 目录结构
- `src/codegen/componentMapper.ts`：内置映射 + 注册机制
- `src/codegen/astGenerator.ts`：AST 生成使用映射
- `src/codegen/templateGenerator.ts`：读取 `context.imports` 生成具名导入

## 关键改动
1. 引入 `registerComponentMappings`、`clearCustomComponentMappings` API：
   - 允许运行期注册自定义组件映射
   - `override` 开关用于覆盖或浅合并平台配置
2. `GenerationContext.imports` 从 `Set<string>` 调整为 `Record<string, Set<string>>`：
   - 按模块路径聚合具名导入，生成更精确的 `import { View, Text } from '@tarojs/components'`
3. `astGenerator` 写入 `context.imports[module].add(component)`；`templateGenerator` 生成导入行。

## 使用示例
```ts
import { registerComponentMappings } from '@/codegen/componentMapper';

registerComponentMappings([
  {
    type: 'Card',
    platforms: {
      weapp: { component: 'View', importPath: '@tarojs/components' },
      alipay: { component: 'View', importPath: '@tarojs/components' },
      h5: { component: 'View', importPath: '@tarojs/components' },
      rn: { component: 'View', importPath: '@tarojs/components' },
      tt: { component: 'View', importPath: '@tarojs/components' },
      qq: { component: 'View', importPath: '@tarojs/components' },
    }
  }
], { override: false });
```

## 测试建议
- 针对每个平台生成简单页面（容器 + 文本 + 按钮），验证导入是否准确、属性/事件是否适配
- 注册新映射覆盖内置 `Button` 的事件名，验证生效与回退

## 后续计划
- 扩充更多组件（Form、List、Tabs、Modal 等）
- 样式映射更细化（单位、颜色、阴影兼容）
- 从 MUI 属性到 Taro 属性的系统化转换规则


