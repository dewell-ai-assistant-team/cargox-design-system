import { Checkbox } from "./Checkbox";
import { cx } from "../utils";
import type { ReactNode } from "react";

/** 筛选菜单的一项；受控消费者可以直接提供 checked 与 onChange。 */
export interface FilterOption<T extends string = string> {
  label: ReactNode;
  value: T;
  checked?: boolean;
  disabled?: boolean;
  onChange?: () => void;
}

/** 原 Document Station 多选菜单的尺寸契约。 */
export type FilterOptionsSize = "default" | "sync" | "document-type";

/** 共享筛选选项菜单属性。 */
export interface FilterOptionsDropdownProps<T extends string = string> {
  options: FilterOption<T>[];
  selectedValues?: T[];
  onChange?: (value: T, selectedValues: T[]) => void;
  multiple?: boolean;
  size?: FilterOptionsSize;
  scroll?: boolean;
  className?: string;
}

/**
 * 共享筛选选项菜单。
 *
 * 单选和多选均沿用原复选框行外观；multiple 只决定选中集合，
 * 业务只需提供选中值和回调，不需要复制菜单布局。
 */
export function FilterOptionsDropdown<T extends string = string>({
  className,
  multiple = false,
  onChange,
  options,
  scroll = false,
  selectedValues = [],
  size = "default",
}: FilterOptionsDropdownProps<T>) {
  const selectedValueSet = new Set(selectedValues);

  function isOptionChecked(option: FilterOption<T>): boolean {
    return option.checked ?? selectedValueSet.has(option.value);
  }

  function handleOptionClick(option: FilterOption<T>): void {
    if (option.disabled) return;
    if (option.onChange) {
      option.onChange();
      return;
    }
    const optionIsChecked = isOptionChecked(option);
    const nextSelectedValues = multiple
      ? optionIsChecked
        ? selectedValues.filter((selectedValue) => selectedValue !== option.value)
        : [...selectedValues, option.value]
      : [option.value];
    onChange?.(option.value, nextSelectedValues);
  }

  return (
    <div className={cx("cx-theme", "cx-filter-options", `cx-filter-options--${size}`, scroll && "cx-filter-options--scroll", className)} role="menu">
      {options.map((option) => {
        const optionIsChecked = isOptionChecked(option);
        const optionLabel = typeof option.label === "string" ? option.label : "filter option";
        return (
          <div className={cx("cx-filter-option", option.disabled && "cx-filter-option--disabled")} key={option.value}>
            <Checkbox aria-label={`Toggle ${optionLabel}`} checked={optionIsChecked} disabled={option.disabled} onCheckedChange={() => handleOptionClick(option)} />
            <span className="cx-filter-option__label">{option.label}</span>
          </div>
        );
      })}
    </div>
  );
}
