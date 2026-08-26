# @cargox/design-system

CargoX 的 React + TypeScript 设计系统包。它把 Figma Components Gallery 的
tokens 与可复用控件抽成独立发布单元，当前包含 Button、Input、Checkbox、
Switch、Badge、Pagination 和泛型 DataTable。

## 安装与样式隔离

```bash
npm install @cargox/design-system
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

## 兼容性

- React 与 React DOM 为 peer dependency，兼容 React 19。
- Vite library build 输出 ESM 和声明文件。
- 库不替换 fsense 现有 `DesignButton`、`RecordsTable` 等实现；迁移可以按
  页面逐步进行，并保留原页面的业务状态与请求逻辑。

设计来源：Figma file `keekWo6ygLKQQw1eNrQYP5`，Components Gallery `5:778`，
Button `1561:2075`、Input `147:3584`、Checkbox `95:22`、Switch `268:933`、
Pagination `230:612`、Table `3183:5008`。
