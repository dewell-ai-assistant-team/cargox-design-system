# @cargox/design-system

CargoX 的 React + TypeScript 设计系统包。它把 Figma Components Gallery 的
tokens 与可复用控件抽成独立发布单元，当前包含 Button、Input、Checkbox、
Switch、Badge、Pagination 和泛型 DataTable。

## 安装与样式隔离

```bash
npm install @cargox/design-system
```

当前仓库是私有库。fsense 使用 Git submodule 固定源码提交，再通过本地文件依赖
安装；这样 fsense 只保存独立库的 gitlink，不保存设计系统源码：

```json
{
  "dependencies": {
    "@cargox/design-system": "file:vendor/cargox-design-system"
  }
}
```

入口只导出 React 组件和 token 引用；样式需要显式引入：

```tsx
import "@cargox/design-system/styles.css";
import { Button, DataTable } from "@cargox/design-system";

export function Screen() {
  return (
    <div className="cx-theme">
      <Button>创建</Button>
    </div>
  );
}
```

所有 CSS 类都使用 `cx-` 前缀，token 只声明在 `.cx-theme` 或
`[data-cx-theme]` 范围内；包不写 `:root`、全局元素选择器或 reset。每个
组件根节点也会带 `cx-theme`，因此单独使用时仍有默认值。宿主应用可以在
自己的主题容器上覆盖 `--cx-*`，而 fsense 的现有 CSS 和组件不会被这个包
反向改写。

## Tokens

`figma-token-manifest.json` 保留 Figma 的 slash/dot 原始命名、值和来源节点，
供设计审计与后续同步使用；其中 `Content/Boby/*` 的历史拼写也原样保留。
运行时 CSS 使用扁平化的 `--cx-*` 名称，TypeScript 使用 `cxToken`：

```tsx
import { cxToken } from "@cargox/design-system";

const style = { color: cxToken.content.headingTheme };
```

表格关键几何 token 与 Figma 对齐：表头 44px、行 40px、选择列 44px、容器
圆角 8px、表头 padding 12px、单元格 inline padding 12px。

## DataTable

DataTable 不认识 Document API、业务记录类型或本地存储 key；宿主通过泛型
列定义和受控状态接入业务：

```tsx
type Row = { id: string; name: string; status: string };

const columns = [
  { id: "name", header: "名称", accessor: "name", sortable: true },
  { id: "status", header: "状态", accessor: "status" },
] satisfies CxTableColumn<Row>[];

<DataTable<Row>
  columns={columns}
  rows={rows}
  rowKey="id"
  selectedRowKeys={selectedRowKeys}
  onSelectedRowKeysChange={setSelectedRowKeys}
  sort={sort}
  onSortChange={setSort}
  columnWidths={columnWidths}
  onColumnWidthsChange={setColumnWidths}
  frozenColumnIds={["name"]}
  toolbar={<Toolbar />}
  footer={<Pagination currentPageNumber={1} pageCount={3} onPageChange={setPage} />}
/>
```

组件覆盖 checkbox selection/indeterminate、三态排序、受控列宽、pointer 与
keyboard resize、frozen columns/sticky header、loading/empty/error、toolbar、
footer 和 `renderCell` slots。列宽和冻结状态建议由宿主持久化，包本身不写入
浏览器存储。

## fsense 迁移基线

- 组件与样式冲突时，以 fsense `outlook-index` 已验证实现为准。
- `fsense-compat.css` 在主题作用域内提供旧变量到 `--cx-*` 的映射；不污染
  `:root`，也不创建第二套 token 值。
- Button、Input、Checkbox、Switch 与 Pagination 的规范 API 和运行时细节已按
  fsense 基线对齐；独立库旧属性名只作为渐进兼容输入。
- `DataTable<TData>` 是通用组件，不替换 fsense 的 `RecordsTable`。后者仍持有
  业务记录类型、列宽持久化、选择浮层和记录操作。

完整差异记录见 [fsense 基线差异审计](docs/fsense-baseline-audit.md)。

## 兼容性

- React 与 React DOM 为 peer dependency，兼容 React 19。
- Vite library build 输出 ESM 和声明文件。
- fsense 可通过原组件路径的轻量 adapter 接入本包，避免改动页面业务调用。
- `RecordsTable` 继续留在 fsense；本包不会接管其请求、持久化或记录操作。

设计来源：Figma file `keekWo6ygLKQQw1eNrQYP5`，Components Gallery `5:778`，
Button `1561:2075`、Input `147:3584`、Checkbox `95:22`、Switch `268:933`、
Pagination `230:612`、Table `3183:5008`。
