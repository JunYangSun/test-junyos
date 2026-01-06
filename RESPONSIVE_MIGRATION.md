# 响应式架构迁移指南

## 概述

本项目已从基于服务端设备检测的多组件架构迁移到基于 Tailwind CSS 响应式类的纯 CSS 适配方案。

## 旧架构 vs 新架构

### 旧架构（已废弃）

**特点：**
- 服务端通过 User-Agent 检测设备类型
- 为每个设备创建独立组件文件（mobile.tsx, pad.tsx, pc.tsx）
- 使用 `useTemplate` hook 和 `TemplateProvider` 管理设备状态
- 客户端动态切换组件

**缺点：**
- 服务端 UA 检测不准确
- 维护多个组件文件，代码重复
- 首屏可能有闪烁（hydration 不匹配）
- 无法响应窗口大小动态变化

### 新架构（当前）

**特点：**
- 纯 CSS 响应式设计，使用 Tailwind 响应式类
- 单个组件文件，通过 CSS 适配不同屏幕
- 无需 JavaScript 设备检测
- 支持窗口大小动态调整

**优点：**
- ✅ 更准确的屏幕适配
- ✅ 代码简洁，易于维护
- ✅ 无 hydration 问题
- ✅ 性能更好（纯 CSS，无 JS 开销）
- ✅ 响应式，支持窗口大小变化

## Tailwind 响应式断点

```typescript
// 默认断点
sm:  640px  // 小屏设备及以上
md:  768px  // 平板及以上
lg:  1024px // 桌面及以上
xl:  1280px // 大屏桌面及以上
2xl: 1536px // 超大屏及以上
```

## 常用响应式模式

### 1. 显示/隐藏元素

```tsx
{/* 只在移动端显示 */}
<div className="block md:hidden">移动端内容</div>

{/* 只在平板及以上显示 */}
<div className="hidden md:block">平板/桌面内容</div>

{/* 只在桌面端显示 */}
<div className="hidden lg:block">桌面内容</div>
```

### 2. 响应式布局

```tsx
{/* 移动端单列，平板2列，桌面3列 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

{/* 移动端垂直堆叠，桌面端水平排列 */}
<div className="flex flex-col lg:flex-row gap-4">
  <Sidebar />
  <Content />
</div>
```

### 3. 响应式尺寸

```tsx
{/* 响应式字体大小 */}
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  标题
</h1>

{/* 响应式间距 */}
<div className="p-4 md:p-6 lg:p-8">
  内容
</div>

{/* 响应式宽度 */}
<div className="w-full md:w-2/3 lg:w-1/2">
  容器
</div>
```

### 4. 响应式导航

```tsx
{/* 移动端：汉堡菜单 */}
<button className="lg:hidden" onClick={toggleMenu}>
  <Menu />
</button>

{/* 桌面端：水平导航 */}
<nav className="hidden lg:flex lg:space-x-6">
  {links.map(link => <Link key={link.href} {...link} />)}
</nav>
```

## 迁移步骤

### 1. 更新模板布局

**旧方式（多文件）：**
```
src/components/templates/common/layout/default/
├── mobile.tsx  ❌ 废弃
├── pad.tsx     ❌ 废弃
└── pc.tsx      ❌ 废弃
```

**新方式（单文件）：**
```tsx
// src/app/[locale]/@tpl_default/layout.tsx
"use client";

export default function DefaultLayout({ children }) {
  return (
    <div className="min-h-screen">
      {/* 移动端顶栏 */}
      <header className="md:hidden">...</header>

      {/* 桌面端侧边栏 */}
      <aside className="hidden md:block md:w-64">...</aside>

      {/* 主内容 */}
      <main className="md:ml-64">{children}</main>
    </div>
  );
}
```

### 2. 移除设备检测代码

**不再需要：**
- ❌ `useTemplate()` hook
- ❌ `TemplateProvider` 的 `serverDevice` prop
- ❌ `getDeviceTypeFromUA()` 函数
- ❌ layout.tsx 中的 User-Agent 检测

### 3. 使用响应式工具类

参考 `src/lib/responsive.config.ts` 中定义的常用响应式类：

```tsx
import { RESPONSIVE_CLASSES } from '@/lib/responsive.config';

<div className={RESPONSIVE_CLASSES.container}>
  <h1 className={RESPONSIVE_CLASSES.text.heading}>标题</h1>
</div>
```

## 示例项目

查看以下文件了解完整示例：

- `src/app/[locale]/@tpl_default/layout.tsx` - 默认模板响应式布局
- `src/app/[locale]/@tpl_enterprise/layout.tsx` - 企业模板响应式布局
- `src/app/[locale]/@tpl_default/page.tsx` - 响应式页面示例
- `src/lib/responsive.config.ts` - 响应式配置和工具类

## 注意事项

1. **移动端优先（Mobile First）**
   - 默认样式为移动端
   - 使用 `md:`, `lg:` 等前缀添加更大屏幕的样式

2. **测试多种屏幕尺寸**
   - 使用浏览器开发工具的响应式设计模式
   - 测试常见断点：375px, 768px, 1024px, 1280px

3. **避免内容闪烁**
   - 使用 CSS 而非 JavaScript 控制显示/隐藏
   - 服务端和客户端渲染结果一致

4. **性能优化**
   - 使用 `hidden` 而非条件渲染（元素仍在 DOM 中）
   - 大型组件可考虑动态导入

## 废弃文件清单

以下文件保留作为参考，但不应在新代码中使用：

- `src/lib/hooks/useTemplate.ts` - 设备检测 hook
- `src/lib/hooks/template.types.ts` - 设备类型定义
- `src/components/templates/common/layout/default/mobile.tsx`
- `src/components/templates/common/layout/default/pad.tsx`
- `src/components/templates/common/layout/default/pc.tsx`
- `src/components/templates/common/layout/templateA/mobile.tsx`
- `src/components/templates/common/layout/templateA/pad.tsx`
- `src/components/templates/common/layout/templateA/pc.tsx`

建议在完成迁移后删除这些文件。
