# 第一阶段：AST 原型与代码生成

本文档记录 AST 生成、样式适配与导入聚合的第一阶段实现细节。

## 目标
- 将组件树转换为平台相关的 AST（`componentToAST`）
- 在 AST 生成过程中完成属性与样式的基础适配
- 在上下文中聚合导入信息，生成规范的 `import` 语句

## 关键文件
- `src/codegen/astGenerator.ts`
- `src/codegen/styleAdapter.ts`
- `src/codegen/templateGenerator.ts`
- `src/codegen/types.ts`

## 关键实现
1. `GenerationContext.imports: Record<string, Set<string>>`
   - 由 AST 生成阶段收集模块与具名组件
   - 代码生成阶段输出具名导入
2. 属性映射
   - `componentMapper` 的 `props` 规则支持 `transform`
3. 样式适配
   - 基础单位转换：`weapp/alipay` → `rpx`，`h5` → `px`，`rn` → 无单位
   - 颜色兼容：`rgba` 的基本处理留有扩展点

## 生成示例
```tsx
// 由 generateComponentCode 输出（片段）
import { View, Text, Button } from '@tarojs/components';
import { FC } from 'react';
import './index.scss';

const Index: FC = () => {
  return (
    <View style={{ padding: '16rpx' }}>
      <Text>hello</Text>
      <Button type="primary" />
    </View>
  );
};
```

## 验证步骤
- 在 `CodeGenerationPanel` 选择平台，生成或预览代码
- 检查导入是否按模块聚合，属性/样式是否符合目标平台

## 后续计划
- 事件/数据绑定生成（双向绑定、受控组件）
- 更丰富的模板片段（页面生命周期、全局样式与路由）
- 将 `styleAdapter` 深度集成到 AST 样式转换流程


