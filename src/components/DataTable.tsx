import * as React from "react";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type Key,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { Checkbox } from "./Checkbox";
import { cx } from "../utils";

const sortRestIcon = new URL(
  "../assets/icons/sort-rest.svg",
  import.meta.url,
).href;
const sortUpIcon = new URL("../assets/icons/sort-up.svg", import.meta.url).href;
const columnsMoreVerticalIcon = new URL(
  "../assets/icons/columns-more-vertical.svg",
  import.meta.url,
).href;
const columnsActionFreezeIcon = new URL(
  "../assets/icons/columns-action-freeze.svg",
  import.meta.url,
).href;

/** Figma Table 的表头高度。 */
export const DATA_TABLE_HEADER_HEIGHT = 44;

/** Figma Table 的数据行高度。 */
export const DATA_TABLE_ROW_HEIGHT = 40;

/** Figma Table 的选择列宽度。 */
export const DATA_TABLE_CHECKBOX_COLUMN_WIDTH = 44;

/** DataTable 可接受的最小列宽。 */
export const DATA_TABLE_MIN_COLUMN_WIDTH = 120;

/** DataTable 未指定列宽时的默认列宽。 */
export const DATA_TABLE_DEFAULT_COLUMN_WIDTH = 200;

/**
 * 计算列的初始宽度，确保列宽和默认宽度都不会小于该列的最小宽度。
 *
 * 全局 120px 是安全下限，column.minWidth 可以进一步提高这个下限。
 */
export function resolveDataTableColumnWidth(
  columnWidth: number | undefined,
  columnMinWidth: number | undefined,
  defaultColumnWidth = DATA_TABLE_DEFAULT_COLUMN_WIDTH,
): number {
  const minimumWidth = Math.max(
    DATA_TABLE_MIN_COLUMN_WIDTH,
    columnMinWidth ?? DATA_TABLE_MIN_COLUMN_WIDTH,
  );
  return Math.max(minimumWidth, columnWidth ?? defaultColumnWidth);
}

/** 三态排序中的方向值。空值代表未排序。 */
export type CxTableSortDirection = "asc" | "desc";

/** DataTable 当前排序状态。 */
export interface CxTableSortState {
  /** 排序列 ID。 */
  id: string;
  /** 排序方向。 */
  direction: CxTableSortDirection;
}

/** DataTable 的单元格渲染器。 */
export type CxTableCellRenderer<TData> = (
  value: unknown,
  row: TData,
  column: CxTableColumn<TData>,
  rowIndex: number,
) => ReactNode;

/** DataTable 列定义，不包含任何业务 API 或业务字段名。 */
export interface CxTableColumn<TData> {
  /** 稳定的列 ID，用于排序、宽度和冻结状态。 */
  id: string;
  /** 表头内容。 */
  header: ReactNode;
  /** 取值字段或取值函数。未提供时由 renderCell 完全负责内容。 */
  accessor?: keyof TData | ((row: TData) => unknown);
  /** 列级渲染插槽。 */
  renderCell?: CxTableCellRenderer<TData>;
  /** 是否支持排序。 */
  sortable?: boolean;
  /** 初始列宽，低于最小值时会被提升到最小值。 */
  width?: number;
  /** 当前列的自定义最小宽度。 */
  minWidth?: number;
  /** 默认是否冻结该列。受控 frozenColumnIds 优先。 */
  frozen?: boolean;
  /** 供宿主识别必需列；库不会删除列。 */
  required?: boolean;
}

/** DataTable 的公共属性。 */
export interface DataTableProps<TData> {
  /** 列定义。 */
  columns: CxTableColumn<TData>[];
  /** 当前页或当前查询结果的数据。 */
  rows: TData[];
  /** 每一行的稳定键。 */
  rowKey: keyof TData | ((row: TData, rowIndex: number) => Key);
  /** 是否展示选择列，默认 true。 */
  enableSelection?: boolean;
  /** 受控选中行键集合。 */
  selectedRowKeys?: Key[];
  /** 非受控选中行键初始值。 */
  defaultSelectedRowKeys?: Key[];
  /** 选中行键变化回调。 */
  onSelectedRowKeysChange?: (rowKeys: Key[]) => void;
  /** 受控排序状态；显式传 null 表示受控未排序。 */
  sort?: CxTableSortState | null;
  /** 非受控排序初始值。 */
  defaultSort?: CxTableSortState | null;
  /** 排序变化回调。 */
  onSortChange?: (sort: CxTableSortState | null) => void;
  /** 受控列宽映射。 */
  columnWidths?: Record<string, number>;
  /** 非受控列宽初始覆盖值。 */
  defaultColumnWidths?: Record<string, number>;
  /** 未配置宽度时使用的默认宽度。 */
  defaultColumnWidth?: number;
  /** 列宽变化回调。 */
  onColumnWidthsChange?: (columnWidths: Record<string, number>) => void;
  /** 受控冻结列 ID。 */
  frozenColumnIds?: string[];
  /** 非受控冻结列 ID 初始值。 */
  defaultFrozenColumnIds?: string[];
  /** 冻结列变化回调。 */
  onFrozenColumnIdsChange?: (columnIds: string[]) => void;
  /** 是否启用表头复选框和行复选框。 */
  showSelectionCheckbox?: boolean;
  /** 是否展示列操作菜单。 */
  showColumnActions?: boolean;
  /** 是否展示列宽拖拽和键盘调整。 */
  showColumnResize?: boolean;
  /** 加载态；加载时不会渲染数据行。 */
  loading?: boolean;
  /** 错误态内容；传入后优先于空态。 */
  error?: ReactNode;
  /** 空数据态内容。 */
  empty?: ReactNode;
  /** 表格上方工具栏插槽。 */
  toolbar?: ReactNode;
  /** 表格下方 footer 插槽。 */
  footer?: ReactNode;
  /** 全局单元格渲染插槽。列级 renderCell 优先。 */
  renderCell?: CxTableCellRenderer<TData>;
  /** 根节点额外类名。 */
  className?: string;
  /** 表格可滚动容器的额外类名。 */
  scrollClassName?: string;
  /** 无障碍表格名称。 */
  ariaLabel?: string;
}

interface CxColumnLayout<TData> {
  column: CxTableColumn<TData>;
  width: number;
  minWidth: number;
  frozen: boolean;
  left: number;
  boundary: boolean;
}

interface CxResizeState {
  columnId: string;
  startX: number;
  startWidth: number;
}

interface CxColumnMenuState {
  columnId: string;
  top: number;
  left: number;
}

function rowKeyToken(rowKey: Key): string {
  return String(rowKey);
}

function readRowKey<TData>(
  rowKey: DataTableProps<TData>["rowKey"],
  row: TData,
  rowIndex: number,
): Key {
  if (typeof rowKey === "function") {
    return rowKey(row, rowIndex);
  }
  return row[rowKey] as Key;
}

function normalizeCellValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === false) {
    return null;
  }
  if (typeof value === "string" || typeof value === "number" || React.isValidElement(value)) {
    return value;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

function getColumnValue<TData>(column: CxTableColumn<TData>, row: TData): unknown {
  if (typeof column.accessor === "function") {
    return column.accessor(row);
  }
  if (column.accessor !== undefined) {
    return row[column.accessor];
  }
  return undefined;
}

function nextSortState(
  columnId: string,
  currentSort: CxTableSortState | null,
): CxTableSortState | null {
  if (currentSort?.id !== columnId) {
    return { id: columnId, direction: "asc" };
  }
  if (currentSort.direction === "asc") {
    return { id: columnId, direction: "desc" };
  }
  return null;
}

/**
 * 通用 DataTable。
 *
 * 组件只负责表格交互和布局：数据请求、业务列名、持久化 key、路由和
 * Document API 都由宿主处理。受控 props 可以让宿主把排序、选择、列宽
 * 和冻结状态接回现有页面状态。
 */
export function DataTable<TData>({
  ariaLabel = "数据表格",
  className,
  columns,
  columnWidths: controlledColumnWidths,
  rows,
  defaultColumnWidth = DATA_TABLE_DEFAULT_COLUMN_WIDTH,
  defaultColumnWidths,
  defaultFrozenColumnIds,
  defaultSelectedRowKeys = [],
  defaultSort = null,
  empty = "暂无数据",
  enableSelection = true,
  error,
  footer,
  frozenColumnIds: controlledFrozenColumnIds,
  loading = false,
  onColumnWidthsChange,
  onFrozenColumnIdsChange,
  onSelectedRowKeysChange,
  onSortChange,
  renderCell,
  rowKey,
  scrollClassName,
  selectedRowKeys: controlledSelectedRowKeys,
  showColumnActions = false,
  showColumnResize = true,
  showSelectionCheckbox = enableSelection,
  sort: controlledSort,
  toolbar,
}: DataTableProps<TData>) {
  const [uncontrolledSelectedRowKeys, setUncontrolledSelectedRowKeys] =
    useState<Key[]>(defaultSelectedRowKeys);
  const [uncontrolledSort, setUncontrolledSort] =
    useState<CxTableSortState | null>(defaultSort);
  const [uncontrolledColumnWidths, setUncontrolledColumnWidths] = useState<
    Record<string, number>
  >(defaultColumnWidths ?? {});
  const [uncontrolledFrozenColumnIds, setUncontrolledFrozenColumnIds] = useState<
    string[]
  >(defaultFrozenColumnIds ?? columns.filter((column) => column.frozen).map((column) => column.id));
  const [resizeState, setResizeState] = useState<CxResizeState | null>(null);
  const [columnMenuState, setColumnMenuState] = useState<CxColumnMenuState | null>(null);

  const selectedRowKeys = controlledSelectedRowKeys ?? uncontrolledSelectedRowKeys;
  const currentSort = controlledSort === undefined ? uncontrolledSort : controlledSort;
  const frozenColumnIds =
    controlledFrozenColumnIds ?? uncontrolledFrozenColumnIds;
  const selectedRowKeySet = useMemo(
    () => new Set(selectedRowKeys.map(rowKeyToken)),
    [selectedRowKeys],
  );
  const currentColumnWidthMap = useMemo(() => {
    const widthMap: Record<string, number> = {};
    for (const column of columns) {
      widthMap[column.id] = resolveDataTableColumnWidth(
        controlledColumnWidths?.[column.id] ??
          uncontrolledColumnWidths[column.id] ??
          column.width,
        column.minWidth,
        defaultColumnWidth,
      );
    }
    return widthMap;
  }, [columns, controlledColumnWidths, defaultColumnWidth, uncontrolledColumnWidths]);

  const columnLayoutList = useMemo(() => {
    const frozenIdSet = new Set(frozenColumnIds);
    const widthLayoutList: CxColumnLayout<TData>[] = [];
    let frozenLeft = enableSelection && showSelectionCheckbox
      ? DATA_TABLE_CHECKBOX_COLUMN_WIDTH
      : 0;
    for (const [columnIndex, column] of columns.entries()) {
      const frozen = frozenIdSet.has(column.id);
      const width = currentColumnWidthMap[column.id] ?? defaultColumnWidth;
      const minWidth = Math.max(
        DATA_TABLE_MIN_COLUMN_WIDTH,
        column.minWidth ?? DATA_TABLE_MIN_COLUMN_WIDTH,
      );
      widthLayoutList.push({
        boundary:
          frozen &&
          (columns[columnIndex + 1] === undefined ||
            !frozenIdSet.has(columns[columnIndex + 1]?.id ?? "")),
        column,
        frozen,
        left: frozen ? frozenLeft : 0,
        minWidth,
        width,
      });
      if (frozen) {
        frozenLeft += width;
      }
    }
    return widthLayoutList;
  }, [
    columns,
    currentColumnWidthMap,
    defaultColumnWidth,
    enableSelection,
    frozenColumnIds,
    showSelectionCheckbox,
  ]);

  const allRowsSelected =
    rows.length > 0 &&
    rows.every((row, rowIndex) =>
      selectedRowKeySet.has(rowKeyToken(readRowKey(rowKey, row, rowIndex))),
    );
  const someRowsSelected =
    !allRowsSelected &&
    rows.some((row, rowIndex) =>
      selectedRowKeySet.has(rowKeyToken(readRowKey(rowKey, row, rowIndex))),
    );
  const columnCount = columns.length + (enableSelection && showSelectionCheckbox ? 1 : 0);

  const emitSelectedRowKeys = (nextSelectedRowKeys: Key[]) => {
    if (controlledSelectedRowKeys === undefined) {
      setUncontrolledSelectedRowKeys(nextSelectedRowKeys);
    }
    onSelectedRowKeysChange?.(nextSelectedRowKeys);
  };

  const toggleRowSelection = (row: TData, rowIndex: number) => {
    const selectedRowKey = readRowKey(rowKey, row, rowIndex);
    const selectedRowKeyToken = rowKeyToken(selectedRowKey);
    const nextSelectedRowKeys = selectedRowKeys.filter(
      (currentRowKey) => rowKeyToken(currentRowKey) !== selectedRowKeyToken,
    );
    if (!selectedRowKeySet.has(selectedRowKeyToken)) {
      nextSelectedRowKeys.push(selectedRowKey);
    }
    emitSelectedRowKeys(nextSelectedRowKeys);
  };

  const toggleAllRows = () => {
    if (allRowsSelected) {
      const rowKeyTokenSet = new Set(
        rows.map((row, rowIndex) => rowKeyToken(readRowKey(rowKey, row, rowIndex))),
      );
      emitSelectedRowKeys(
        selectedRowKeys.filter((selectedRowKey) => !rowKeyTokenSet.has(rowKeyToken(selectedRowKey))),
      );
      return;
    }
    const nextSelectedRowKeys = [...selectedRowKeys];
    for (const [rowIndex, row] of rows.entries()) {
      const nextRowKey = readRowKey(rowKey, row, rowIndex);
      if (!selectedRowKeySet.has(rowKeyToken(nextRowKey))) {
        nextSelectedRowKeys.push(nextRowKey);
      }
    }
    emitSelectedRowKeys(nextSelectedRowKeys);
  };

  const emitSort = (nextSort: CxTableSortState | null) => {
    if (controlledSort === undefined) {
      setUncontrolledSort(nextSort);
    }
    onSortChange?.(nextSort);
  };

  const handleSort = (column: CxTableColumn<TData>) => {
    if (column.sortable) {
      emitSort(nextSortState(column.id, currentSort));
    }
  };

  const emitColumnWidths = (nextColumnWidths: Record<string, number>) => {
    if (controlledColumnWidths !== undefined) {
      onColumnWidthsChange?.(nextColumnWidths);
      return;
    }
    setUncontrolledColumnWidths(nextColumnWidths);
    onColumnWidthsChange?.(nextColumnWidths);
  };

  const updateColumnWidth = (columnId: string, requestedWidth: number) => {
    const columnLayout = columnLayoutList.find(({ column }) => column.id === columnId);
    if (!columnLayout) {
      return;
    }
    const nextWidth = Math.max(columnLayout.minWidth, requestedWidth);
    emitColumnWidths({ ...currentColumnWidthMap, [columnId]: nextWidth });
  };

  const handleResizePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    columnId: string,
  ) => {
    event.preventDefault();
    const startWidth = currentColumnWidthMap[columnId] ?? defaultColumnWidth;
    setResizeState({ columnId, startWidth, startX: event.clientX });
  };

  useEffect(() => {
    if (!resizeState) {
      return undefined;
    }
    const handlePointerMove = (event: PointerEvent) => {
      updateColumnWidth(
        resizeState.columnId,
        resizeState.startWidth + event.clientX - resizeState.startX,
      );
    };
    const handlePointerUp = () => {
      setResizeState(null);
    };
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizeState]);

  const handleResizeKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    columnId: string,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    const currentWidth = currentColumnWidthMap[columnId] ?? defaultColumnWidth;
    updateColumnWidth(columnId, currentWidth + (event.key === "ArrowRight" ? 16 : -16));
  };

  const emitFrozenColumnIds = (nextColumnIds: string[]) => {
    if (controlledFrozenColumnIds === undefined) {
      setUncontrolledFrozenColumnIds(nextColumnIds);
    }
    onFrozenColumnIdsChange?.(nextColumnIds);
  };

  const toggleColumnFrozen = (columnId: string) => {
    const frozenIdSet = new Set(frozenColumnIds);
    if (frozenIdSet.has(columnId)) {
      frozenIdSet.delete(columnId);
    } else {
      frozenIdSet.add(columnId);
    }
    emitFrozenColumnIds(columns.map((column) => column.id).filter((id) => frozenIdSet.has(id)));
    setColumnMenuState(null);
  };

  const renderTableCell = (
    row: TData,
    column: CxTableColumn<TData>,
    rowIndex: number,
  ) => {
    const value = getColumnValue(column, row);
    const renderer = column.renderCell ?? renderCell;
    return renderer
      ? renderer(value, row, column, rowIndex)
      : normalizeCellValue(value);
  };

  const renderStateRow = (content: ReactNode, stateClassName?: string) => (
    <tr className="cx-data-table__state-row">
      <td
        className={cx("cx-data-table__state-cell", stateClassName)}
        colSpan={Math.max(1, columnCount)}
      >
        {loading ? (
          <span className="cx-data-table__loading-label">
            <span aria-hidden="true" className="cx-data-table__loading-dot" />
            {content}
          </span>
        ) : (
          content
        )}
      </td>
    </tr>
  );

  const getColumnStyle = (
    columnLayout: CxColumnLayout<TData>,
  ): CSSProperties => ({
    width: columnLayout.width,
    ...(columnLayout.frozen ? { left: columnLayout.left } : {}),
  });

  return (
    <section
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      className={cx("cx-theme", "cx-data-table", className)}
    >
      {toolbar ? <div className="cx-data-table__toolbar">{toolbar}</div> : null}
      <div className={cx("cx-data-table__scroll", scrollClassName)}>
        <table className="cx-data-table__grid">
          <thead className="cx-data-table__head">
            <tr className="cx-data-table__header-row">
              {enableSelection && showSelectionCheckbox ? (
                <th
                  className={cx(
                    "cx-data-table__header-cell",
                    "cx-data-table__checkbox-cell",
                    "cx-data-table__sticky",
                  )}
                  scope="col"
                  style={{
                    left: 0,
                    width: DATA_TABLE_CHECKBOX_COLUMN_WIDTH,
                  }}
                >
                  <Checkbox
                    aria-label="选择全部行"
                    checked={allRowsSelected}
                    indeterminate={someRowsSelected}
                    onCheckedChange={toggleAllRows}
                  />
                </th>
              ) : null}
              {columnLayoutList.map((columnLayout) => {
                const { column } = columnLayout;
                const isActiveSort = currentSort?.id === column.id;
                const sortDirection = isActiveSort ? currentSort?.direction : undefined;
                const ariaSort = isActiveSort
                  ? currentSort.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none";
                return (
                  <th
                    aria-sort={ariaSort}
                    className={cx(
                      "cx-data-table__header-cell",
                      "cx-data-table__sticky",
                      columnLayout.boundary && "cx-data-table__sticky--boundary",
                    )}
                    key={column.id}
                    scope="col"
                    style={getColumnStyle(columnLayout)}
                  >
                    <span className="cx-data-table__header-content">
                      {column.sortable ? (
                        <button
                          aria-label={`按${String(column.header)}排序`}
                          className="cx-data-table__sort-button"
                          onClick={() => handleSort(column)}
                          type="button"
                        >
                          <span className="cx-data-table__header-label">{column.header}</span>
                          <span
                            aria-hidden="true"
                            className={cx(
                              "cx-data-table__sort-icon",
                              isActiveSort && "cx-data-table__sort-icon--active",
                              sortDirection === "desc" &&
                                "cx-data-table__sort-icon--descending",
                            )}
                          >
                            <img
                              alt=""
                              src={isActiveSort ? sortUpIcon : sortRestIcon}
                            />
                          </span>
                        </button>
                      ) : (
                        <span className="cx-data-table__header-label">{column.header}</span>
                      )}
                      {showColumnActions ? (
                        <button
                          aria-label={`打开${String(column.header)}列操作`}
                          className="cx-data-table__column-action"
                          onClick={(event) => {
                            const rect = event.currentTarget.getBoundingClientRect();
                            setColumnMenuState({
                              columnId: column.id,
                              left: rect.left,
                              top: rect.bottom + 4,
                            });
                          }}
                          type="button"
                        >
                          <img
                            alt=""
                            aria-hidden="true"
                            className="cx-data-table__column-action-icon"
                            src={columnsMoreVerticalIcon}
                          />
                        </button>
                      ) : null}
                    </span>
                    {showColumnResize ? (
                      <button
                        aria-label={`调整${String(column.header)}列宽`}
                        className={cx(
                          "cx-data-table__resize-handle",
                          resizeState?.columnId === column.id &&
                            "cx-data-table__resize-handle--active",
                        )}
                        onKeyDown={(event) => handleResizeKeyDown(event, column.id)}
                        onPointerDown={(event) => handleResizePointerDown(event, column.id)}
                        type="button"
                      />
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="cx-data-table__body">
            {loading
              ? renderStateRow("加载中")
              : error
                ? renderStateRow(error, "cx-data-table__state-cell--error")
                : rows.length === 0
                  ? renderStateRow(empty)
                  : rows.map((row, rowIndex) => {
                      const currentRowKey = readRowKey(rowKey, row, rowIndex);
                      const currentRowKeyToken = rowKeyToken(currentRowKey);
                      const rowSelected = selectedRowKeySet.has(currentRowKeyToken);
                      return (
                        <tr
                          aria-selected={rowSelected}
                          className={cx(
                            "cx-data-table__row",
                            rowSelected && "cx-data-table__row--selected",
                          )}
                          key={currentRowKeyToken}
                        >
                          {enableSelection && showSelectionCheckbox ? (
                            <td
                              className={cx(
                                "cx-data-table__cell",
                                "cx-data-table__checkbox-cell",
                                "cx-data-table__sticky",
                              )}
                              style={{
                                left: 0,
                                width: DATA_TABLE_CHECKBOX_COLUMN_WIDTH,
                              }}
                            >
                              <Checkbox
                                aria-label={`选择第 ${rowIndex + 1} 行`}
                                checked={rowSelected}
                                onCheckedChange={() => toggleRowSelection(row, rowIndex)}
                              />
                            </td>
                          ) : null}
                          {columnLayoutList.map((columnLayout) => (
                            <td
                              className={cx(
                                "cx-data-table__cell",
                                columnLayout.frozen && "cx-data-table__sticky",
                                columnLayout.boundary && "cx-data-table__sticky--boundary",
                              )}
                              key={columnLayout.column.id}
                              style={getColumnStyle(columnLayout)}
                            >
                              {renderTableCell(row, columnLayout.column, rowIndex)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
          </tbody>
        </table>
      </div>
      {footer ? <div className="cx-data-table__footer">{footer}</div> : null}
      {columnMenuState ? (
        <div
          aria-label="列操作"
          className="cx-data-table__column-menu"
          role="menu"
          style={{ left: columnMenuState.left, top: columnMenuState.top }}
        >
          <button
            className="cx-data-table__column-menu-item"
            onClick={() => toggleColumnFrozen(columnMenuState.columnId)}
            role="menuitem"
            type="button"
          >
            <img
              alt=""
              aria-hidden="true"
              className="cx-data-table__column-menu-icon"
              src={columnsActionFreezeIcon}
            />
            {frozenColumnIds.includes(columnMenuState.columnId) ? "取消冻结" : "冻结列"}
          </button>
          <button
            className="cx-data-table__column-menu-item"
            onClick={() => setColumnMenuState(null)}
            role="menuitem"
            type="button"
          >
            关闭
          </button>
        </div>
      ) : null}
    </section>
  );
}
