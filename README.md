# @cargox/design-system

CargoX 的 React + TypeScript 设计系统包。它把 Figma Components Gallery 的
tokens 与可复用控件抽成独立发布单元，当前包含 Button、IconButton、SplitButton、
Input、Checkbox、Switch、Badge、Pagination、Select、SelectTrigger 和泛型 DataTable。

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

### IconButton

IconButton 只接收 `icon`，不使用 `children`。每个按钮必须通过 `aria-label` 或
`aria-labelledby` 提供可访问名称：

```tsx
import { IconButton } from "@cargox/design-system";

<IconButton aria-label="刷新" icon={<RefreshIcon />} />
<IconButton
  aria-labelledby="settings-label"
  icon={<SettingsIcon />}
  variant="regular-icon"
/>
```

### SplitButton

SplitButton 只提供组合按钮，不创建菜单、portal、选项或打开状态。宿主负责菜单的
渲染、定位和交互，并把 `aria-haspopup` 与 `aria-expanded` 传给 Trigger：

```tsx
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonTrigger,
} from "@cargox/design-system";

<SplitButton disabled={saving} size="lg" variant="fill">
  <SplitButtonAction leadingIcon={<SaveIcon />} onClick={save}>
    保存
  </SplitButtonAction>
  <SplitButtonTrigger
    aria-expanded={menuOpen}
    aria-haspopup="menu"
    aria-label="打开保存选项"
    onClick={() => setMenuOpen((open) => !open)}
  />
</SplitButton>
{menuOpen ? <SaveOptionsMenu /> : null}
```

`SplitButtonTrigger` 与 IconButton 一样，必须使用 `aria-label` 或
`aria-labelledby` 二选一提供可访问名称。组合级 `disabled` 会传播到两个原生
button，同时子按钮仍可单独禁用。

### Select

Select 只提供组合与 blur 边界；业务宿主控制 `open`、`value`、`options`、菜单和
选择行为：

```tsx
import { useState } from "react";
import { Select, SelectTrigger } from "@cargox/design-system";

const options = ["海运", "空运"];

export function TransportTypeField() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(options[0]);

  return (
    <Select
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <SelectTrigger
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        {value}
      </SelectTrigger>
      {open ? (
        <div role="listbox">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                setValue(option);
                setOpen(false);
              }}
              role="option"
              aria-selected={option === value}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </Select>
  );
}
```

组件不拥有业务 `options`、`open` 或 `value`，也不渲染 portal；宿主可以按页面需要
组合菜单、blur 和业务同步逻辑。

所有 CSS 类都使用 `cx-` 前缀，token 只声明在 `.cx-theme` 或
`[data-cx-theme]` 范围内；包不写 `:root`、全局元素选择器或 reset。每个
组件根节点也会带 `cx-theme`，因此单独使用时仍有默认值。宿主应用可以在
自己的主题容器上覆盖 `--cx-*`，而 fsense 的现有 CSS 和组件不会被这个包
反向改写。

### Tailwind v4 导入顺序与 cascade

如果宿主使用 Tailwind v4，请先导入 design-system 样式，再导入首行包含
`@import "tailwindcss"` 的宿主样式：

```tsx
import "@cargox/design-system/styles.css";
import "./index.css";
```

design-system 会先声明完整层顺序
`theme, base, components, cargox-tokens, cargox-components, utilities`。
这样 Tailwind 的 base/components 位于 CargoX token/component 层之前，Tailwind
utilities（例如 `w-*`、`h-*`、`justify-*`、`p-*`）可以覆盖组件布局；宿主未分层
的 fsense 页面规则也可以组合覆盖布局。这个兼容约定依赖上述导入顺序，不宣称
任意导入顺序都具有相同结果。

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

### Dashboard 量度补充（0.2.8）

运行时新增紧凑字号（10/11/13px）、24px 数值字号、12/14/18/24/26/28/32px 行高、
紧字距与补充尺寸阶梯，均通过 `cxToken` 和 `--cx-*` 提供。来源是已有 Dashboard
量度的集中维护，并非新增 Figma 采集结果，因此不改写原始 `figma-token-manifest.json`。
宿主可将 Tailwind theme 映射到这些变量；页面布局几何（例如弹窗整体宽高）仍由宿主拥有。

## Pagination

`variant` 可在截图适配时选择分页控件的展示密度；三种模式共用相同的页码规则：保留首尾各三页和当前页前后一页，单页缺口会展开为页码，较大的缺口才显示省略号。
`totalLabel` 在所有模式中保持显示。

```tsx
const paginationProps = {
  currentPageNumber,
  pageCount,
  onPageChange: setCurrentPage,
  totalLabel: "1-20 of 285",
};

<Pagination
  {...paginationProps}
  variant="full"
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
/>
<Pagination {...paginationProps} variant="no-page-size" />
<Pagination {...paginationProps} variant="basic" />
```

`full` 显示页大小选择器和跳页输入框；`no-page-size` 只显示跳页输入框；`basic`
隐藏这两项。未设置 `variant` 时，继续由 `showPageSize`、`showJumpTo` 和
`pageSizeLabel` 控制旧行为；显式设置 `variant` 后，它优先决定这两项的可见性。

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

## 发布与消费项目同步流程

本仓库是组件、样式与 tokens 的唯一源码仓库。demo 的
`frontend-public/vendor/cargox-design-system` 与 fsense 的 submodule 均引用这里的提交。
新增的 `FilterButton`、`SortableList` 和 `SortableRow` 也从包的统一入口导出。

不要在 fsense 的
`outlook-index/vendor/cargox-design-system` submodule 内直接修改源码；该目录只用于
消费已提交并推送到本仓库的版本。

每次组件或 token 变更按以下顺序执行：

1. 在本仓库修改、测试并更新 package version。
2. 提交并推送 `main`，创建与 package version 一致的 `v*` tag 和 GitHub Release。
3. 在 fsense 根目录运行 `just design-system-sync vX.Y.Z`，只更新 submodule gitlink
   和本地 file dependency。
4. 在 fsense 运行 `just design-system-check` 和页面回归验证后再提交 fsense 变更。

fsense 的检查 harness 会拒绝 submodule 内的未提交源码修改，从而避免从宿主仓库
反向维护设计系统。

## 兼容性

- React 与 React DOM 为 peer dependency，兼容 React 19。
- Vite library build 输出 ESM 和声明文件。
- fsense 可通过原组件路径的轻量 adapter 接入本包，避免改动页面业务调用。
- `RecordsTable` 继续留在 fsense；本包不会接管其请求、持久化或记录操作。

设计来源：Figma file `keekWo6ygLKQQw1eNrQYP5`，Components Gallery `5:778`，
Button `1561:2075`、Input `147:3584`、Checkbox `95:22`、Switch `268:933`、
Pagination `230:612`、Table `3183:5008`。

### 大型弹窗阴影（0.2.9）

`--cx-shadow-overlay-large` / `cxToken.shadow.overlayLarge` 用于大型浮层与设置窗口，
以宽范围柔和投影、近距离阴影和边缘轮廓增强与背景的层次区分。
这是按 Dashboard 的 macOS 窗口参考新增的视觉扩展，不是原 Figma manifest 的采集值。
小型菜单继续使用原有 overlay-small/medium，不随本次扩展改变。
