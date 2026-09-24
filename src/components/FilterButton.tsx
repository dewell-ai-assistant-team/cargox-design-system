import {
  useRef,
  useState,
  type ReactNode,
} from "react";

import { FilterOptionsDropdown, type FilterOption } from "./FilterOptionsDropdown";
import { cx } from "../utils";

const filterChevronIcon = new URL(
  "../assets/icons/filter-chevron.svg",
  import.meta.url,
).href;
const filterDismissIcon = new URL(
  "../assets/icons/filter-dismiss.svg",
  import.meta.url,
).href;

/** 共享筛选菜单选项。value 应保持稳定，以便消费者保存筛选上下文。 */
export type { FilterOption } from "./FilterOptionsDropdown";

/** FilterButton 的公共属性。 */
export interface FilterButtonProps<T extends string = string> {
  label: ReactNode;
  options?: FilterOption<T>[];
  /** 受控打开状态；与 onToggle 一起用于保留业务自定义菜单。 */
  open?: boolean;
  onToggle?: () => void;
  value?: T;
  selectedValues?: T[];
  onChange?: (value: T | undefined, selectedValues: T[]) => void;
  onClear?: () => void;
  clearIcon?: ReactNode;
  multiple?: boolean;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  active?: boolean;
  "aria-label"?: string;
}

/**
 * CargoX 共享筛选触发器与选项菜单。
 *
 * 默认多选模式只维护选项并由消费者决定何时应用；显式传入
 * `multiple={false}` 时保留单选行为。Escape 只关闭菜单，事件不会向外层弹窗传播。
 */
export function FilterButton<T extends string = string>({
  active,
  "aria-label": ariaLabel,
  className,
  clearIcon,
  disabled = false,
  label,
  menuClassName,
  multiple = true,
  onChange,
  onClear,
  options = [],
  onToggle,
  open,
  selectedValues,
  value,
}: FilterButtonProps<T>) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedSet = new Set(selectedValues ?? (value === undefined ? [] : [value]));
  const isOpen = open ?? uncontrolledOpen;
  const isActive = active ?? selectedSet.size > 0;
  const triggerRef = useRef<HTMLButtonElement>(null);

  function closeMenu(): void {
    if (open === undefined) setUncontrolledOpen(false);
    else onToggle?.();
    triggerRef.current?.focus({ preventScroll: true });
  }

  return (
    <div
      className={cx("cx-theme", "cx-filter", isActive && "cx-filter--active", className)}
      onBlur={(event) => {
        if (open === undefined && !event.currentTarget.contains(event.relatedTarget)) {
          setUncontrolledOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (isOpen && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeMenu();
        }
      }}
      ref={rootRef}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className="cx-filter__trigger"
        data-active={isActive}
        disabled={disabled}
        onClick={() => {
          if (onToggle) onToggle();
          else setUncontrolledOpen((nextOpen) => !nextOpen);
        }}
        ref={triggerRef}
        type="button"
      >
        <span className="cx-filter__label">{label}</span>
        <span
          aria-hidden="true"
          className="cx-filter__caret"
          style={{
            maskImage: `url("${filterChevronIcon}")`,
            WebkitMaskImage: `url("${filterChevronIcon}")`,
          }}
        />
      </button>
      {isActive && onClear ? (
        <button
          aria-label={`Clear ${typeof label === "string" ? label : "filter"} filter`}
          className="cx-filter__clear"
          onClick={onClear}
          type="button"
        >
          {clearIcon ?? (
            <span
              aria-hidden="true"
              className="cx-filter__clear-icon"
              style={{
                maskImage: `url("${filterDismissIcon}")`,
                WebkitMaskImage: `url("${filterDismissIcon}")`,
              }}
            />
          )}
        </button>
      ) : null}
      {isOpen && options.length > 0 ? <FilterOptionsDropdown className={menuClassName} multiple={multiple} onChange={(nextValue, nextSelectedValues) => { onChange?.(nextValue, nextSelectedValues); if (!multiple) closeMenu(); }} options={options} selectedValues={[...selectedSet]} /> : null}
    </div>
  );
}
