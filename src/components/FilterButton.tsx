import {
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Button } from "./Button";
import { cx } from "../utils";

/** 共享筛选菜单选项。value 应保持稳定，以便消费者保存筛选上下文。 */
export interface FilterOption<T extends string = string> {
  label: ReactNode;
  value: T;
  disabled?: boolean;
}

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
 * 单选模式点击选项即关闭菜单并回传当前值；多选模式只维护选项并由
 * 消费者决定何时应用。Escape 只关闭菜单，事件不会向外层弹窗传播。
 */
export function FilterButton<T extends string = string>({
  active,
  "aria-label": ariaLabel,
  className,
  clearIcon,
  disabled = false,
  label,
  menuClassName,
  multiple = false,
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

  function handleOptionChange(option: FilterOption<T>) {
    if (option.disabled) return;
    if (multiple) {
      const nextSelectedValues = selectedSet.has(option.value)
        ? [...selectedSet].filter((selectedValue) => selectedValue !== option.value)
        : [...selectedSet, option.value];
      onChange?.(nextSelectedValues[0], nextSelectedValues);
      return;
    }
    onChange?.(option.value, [option.value]);
    if (open === undefined) setUncontrolledOpen(false);
  }

  return (
    <div
      className={cx("cx-theme", "cx-filter", className)}
      onBlur={(event) => {
        if (open === undefined && !event.currentTarget.contains(event.relatedTarget)) {
          setUncontrolledOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (open === undefined && isOpen && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setUncontrolledOpen(false);
          triggerRef.current?.focus({ preventScroll: true });
        }
      }}
      ref={rootRef}
    >
      <Button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className={cx("cx-filter__trigger", isActive && "cx-filter__trigger--active")}
        disabled={disabled}
        onClick={() => {
          if (onToggle) onToggle();
          else setUncontrolledOpen((nextOpen) => !nextOpen);
        }}
        ref={triggerRef}
        size="sm"
        trailingIcon={<span aria-hidden="true" className="cx-filter__caret" />}
        variant="text"
      >
        <span className="cx-filter__label">{label}</span>
      </Button>
      {isActive && onClear ? (
        <button
          aria-label={`Clear ${typeof label === "string" ? label : "filter"}`}
          className="cx-filter__clear"
          onClick={onClear}
          type="button"
        >
          {clearIcon ?? <span aria-hidden="true">×</span>}
        </button>
      ) : null}
      {isOpen && options.length > 0 ? (
        <div className={cx("cx-filter__menu", menuClassName)} role="menu">
          {options.map((option) => (
            <button
              aria-checked={selectedSet.has(option.value)}
              className={cx(
                "cx-filter__option",
                selectedSet.has(option.value) && "cx-filter__option--selected",
              )}
              disabled={option.disabled}
              key={option.value}
              onClick={() => handleOptionChange(option)}
              role={multiple ? "menuitemcheckbox" : "menuitemradio"}
              type="button"
            >
              {multiple ? <span aria-hidden="true" className={cx("cx-filter__checkbox", selectedSet.has(option.value) && "cx-filter__checkbox--checked")}>{selectedSet.has(option.value) ? "✓" : null}</span> : null}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
