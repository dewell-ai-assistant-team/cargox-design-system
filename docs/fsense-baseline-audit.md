# fsense 基线差异审计

本轮审计用于把 CargoX Design System 从 fsense 迁移为独立包。比较来源包括：

- fsense `outlook-index` 当前已验证的组件与 `document-station.css`；
- Figma Design System 文件 `keekWo6ygLKQQw1eNrQYP5`；
- `@cargox/design-system` 独立包的迁移前实现。

冲突规则是：Figma 或独立包与 fsense 当前行为不一致时，以 fsense 已验证实现为准。

## 审计结论

| 范围 | 差异 | 本轮基线 |
| --- | --- | --- |
| Core tokens | 51 项规范值经语义别名解析后无差异 | 保留 `--cx-*` 命名，并提供 scoped fsense 旧变量别名 |
| Button | 独立包字重为 500、禁用态依赖透明度，尺寸/variant 名含 camelCase 别名 | 使用 fsense 的 400 字重、显式禁用色与 kebab-case API；旧别名仅作为兼容输入 |
| Input | 独立包使用 wrapper，改变宿主 DOM 与布局 | 使用 fsense 的原生 `input` 根节点及 default/error/readOnly/unavailable/table-cell 状态 |
| Checkbox | 独立包使用字符标记 | 使用 fsense 已验证的精确 SVG checkmark 与三态语义 |
| Switch | 独立包用 CSS 绘制轨道和滑块 | 使用 fsense 的 active/rest/disabled SVG 与 default/compact 尺寸 |
| Pagination | 独立包使用原生 select、字符箭头及不同页码算法 | 使用 fsense 的自定义页大小菜单、精确 SVG、Go to 表单、外部点击和 Escape 关闭行为 |
| DataTable | 通用表格无法承载 RecordsTable 的业务行、持久化和记录操作 | 保留通用 `DataTable<TData>`；fsense 的 `RecordsTable` 不迁移、不替换 |

## 样式隔离与兼容边界

- 变量只在 `.cx-theme` 与 `[data-cx-theme]` 下声明，不写 `:root`。
- 组件类名统一为 `cx-` 前缀，不引入全局 reset。
- `fsense-compat.css` 只在同一主题作用域内把 fsense 旧变量映射到 `--cx-*`，让
  现有页面可以逐步移除本地 token 定义。
- 兼容别名不得成为新代码的规范 API；新页面使用 `--cx-*` 与导出的组件属性。

## 表格边界

`DataTable<TData>` 只负责通用布局、选择、排序、列宽、冻结列和状态展示。
Document Station 的 `RecordsTable` 继续由 fsense 持有，因为它还负责业务记录类型、
列宽持久化、选择浮层、预览/打开记录等应用契约。只有在这些契约被显式拆分并完成
页面级回归验证后，才考虑进一步迁移。
