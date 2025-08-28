# Taro 重构计划 - 第一阶段落地说明

本阶段聚焦组件映射、AST 原型与基础代码生成，支持多端（WeApp/Alipay/H5/RN/TT/QQ）基础页面的导出与预览。

## 包含内容
- 组件映射与注册：`src/codegen/componentMapper.ts`
- AST 生成：`src/codegen/astGenerator.ts`
- 样式适配：`src/codegen/styleAdapter.ts`
- 模板/导入生成：`src/codegen/templateGenerator.ts`
- 面板入口：`src/components/CodeGeneration/CodeGenerationPanel.tsx`

## 开发者快速开始
1. 在编辑器中搭建页面（容器/文本/按钮）
2. 打开“代码生成”面板，选择目标平台
3. 选择“预览代码”或“生成代码/下载项目”

## 扩展组件映射
参考 `TARO_PHASE1_COMPONENT_MAPPING.md` 中的注册示例，新增或覆盖平台映射。

## 注意事项
- 生成的 `package.json`、`tsconfig.json` 等为基础模板，可根据项目需要调整
- 历史页面 JSON 若缺少 `name` 或组件 `id/type`，验证会报错

## 后续阶段
- 第二阶段：完善代码生成逻辑（路由、项目结构、更多组件）
- 第三阶段：多端预览、导出优化与性能/质量保障


