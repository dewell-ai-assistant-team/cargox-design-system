import { Checkbox } from "./Checkbox";
import { cx } from "../utils";
import type { ReactNode } from "react";

/** 筛选菜单的一项；受控消费者可以直接提供 checked 与 onChange。 */
export interface FilterOption<T extends string = string> {
  label: ReactNode;
  value: T;
  checked?: boolean;
  intermediate?: boolean;
  indeterminate?: boolean;
  /** 明确标记全选项，组件不会根据文案猜测其语义。 */
  selectAll?: boolean;
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
 * 默认使用多选集合；`multiple={false}` 保留单选兼容行为。带有
 * `selectAll` 标记的选项会显示全选与半选状态，点击内部实现的全选项
 * 始终选中所有可用选项。业务只需提供选中值和回调，不需要复制菜单布局。
 */
export function FilterOptionsDropdown<T extends string = string>({
  className,
  multiple = true,
  onChange,
  options,
  scroll = false,
  selectedValues = [],
  size = "default",
}: FilterOptionsDropdownProps<T>) {
  const selectedValueSet = new Set(selectedValues);
  const selectableOptions = options.filter((option) => !option.disabled && !option.selectAll);

  function isOptionChecked(option: FilterOption<T>): boolean {
    if (option.selectAll && option.checked === undefined) {
      return selectableOptions.length > 0 && selectableOptions.every(isOptionChecked);
    }
    return option.checked ?? selectedValueSet.has(option.value);
  }

  function isOptionIntermediate(option: FilterOption<T>): boolean {
    if (option.intermediate !== undefined) return option.intermediate;
    if (option.indeterminate !== undefined) return option.indeterminate;
    if (!option.selectAll || option.checked !== undefined) return false;
    const selectedOptionCount = selectableOptions.filter(isOptionChecked).length;
    return selectedOptionCount > 0 && selectedOptionCount < selectableOptions.length;
  }

  function handleOptionClick(option: FilterOption<T>): void {
    if (option.disabled) return;
    if (option.onChange) {
      option.onChange();
      return;
    }
    const optionIsChecked = isOptionChecked(option);
    const nextSelectedValues = option.selectAll
      ? selectableOptions.map((selectableOption) => selectableOption.value)
      : multiple
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
        const optionIsIntermediate = isOptionIntermediate(option);
        const optionLabel = typeof option.label === "string" ? option.label : "filter option";
        return (
          <div
            aria-checked={optionIsIntermediate ? "mixed" : optionIsChecked}
            className={cx("cx-filter-option", option.disabled && "cx-filter-option--disabled")}
            key={option.value}
            onClick={() => handleOptionClick(option)}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Spacebar") {
                event.preventDefault();
                handleOptionClick(option);
              }
            }}
            role="menuitemcheckbox"
            tabIndex={option.disabled ? -1 : 0}
          >
            <Checkbox aria-label={`Toggle ${optionLabel}`} checked={optionIsChecked} indeterminate={optionIsIntermediate} disabled={option.disabled} onCheckedChange={() => handleOptionClick(option)} onClick={(event) => event.stopPropagation()} tabIndex={-1} />
            <span className="cx-filter-option__label">{option.label}</span>
          </div>
        );
      })}
    </div>
  );
}
