import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

import { cx } from "../utils";

const checkboxCheckmarkIcon = new URL(
  "../assets/icons/checkbox-checkmark.svg",
  import.meta.url,
).href;

/** Checkbox 的受控值变化回调。 */
export type CxCheckboxChangeHandler = (checked: boolean) => void;

/** CargoX Checkbox 的公共属性。 */
export interface CxCheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** 当前是否选中。未传入时组件会根据默认值维护内部状态。 */
  checked?: boolean;
  /** 当前是否为半选状态，通常用于表格表头。 */
  intermediate?: boolean;
  /** `intermediate` 的兼容别名。 */
  indeterminate?: boolean;
  /** 非受控模式的初始值。 */
  defaultChecked?: boolean;
  /** 值变化回调。 */
  onCheckedChange?: CxCheckboxChangeHandler;
  /** fsense 基准回调别名。 */
  onChange?: () => void;
  /** 右侧标签，可传 ReactNode。 */
  label?: ReactNode;
}

/** CargoX Checkbox 组件，支持 checked / mixed / unchecked 三种状态。 */
export const Checkbox = forwardRef<HTMLButtonElement, CxCheckboxProps>(
  function Checkbox(
    {
      checked: controlledChecked,
      className,
      defaultChecked = false,
      disabled,
      intermediate = false,
      indeterminate = false,
      label,
      onChange,
      onCheckedChange,
      onClick,
      type = "button",
      ...buttonProps
    },
    ref,
  ) {
    const [uncontrolledChecked, setUncontrolledChecked] =
      useState(defaultChecked);
    const checked = controlledChecked ?? uncontrolledChecked;
    const isIntermediate = intermediate || indeterminate;
    const isActive = checked || isIntermediate;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      const nextChecked = !checked;
      if (controlledChecked === undefined) {
        setUncontrolledChecked(nextChecked);
      }
      onChange?.();
      onCheckedChange?.(nextChecked);
      onClick?.(event);
    };

    return (
      <button
        {...buttonProps}
        ref={ref}
        aria-checked={isIntermediate ? "mixed" : checked}
        aria-label={buttonProps["aria-label"] ?? (typeof label === "string" ? label : undefined)}
        aria-pressed={isActive}
        className={cx(
          "cx-theme",
          "cx-checkbox",
          checked && "cx-checkbox--checked",
          isIntermediate && "cx-checkbox--intermediate",
          disabled && "cx-checkbox--disabled",
          label !== undefined && "cx-checkbox--with-label",
          className,
        )}
        disabled={disabled}
        onClick={handleClick}
        role="checkbox"
        type={type}
      >
        <span aria-hidden="true" className="cx-checkbox__box">
          {checked ? (
            <img
              alt=""
              className="cx-checkbox__checkmark"
              src={checkboxCheckmarkIcon}
            />
          ) : null}
          {isIntermediate ? <span className="cx-checkbox__mark" /> : null}
        </span>
        {label !== undefined ? <span className="cx-checkbox__label">{label}</span> : null}
      </button>
    );
  },
);

Checkbox.displayName = "CargoXCheckbox";
