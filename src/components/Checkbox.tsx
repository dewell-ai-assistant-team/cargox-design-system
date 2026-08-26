import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import * as React from "react";

import { cx } from "../utils";

/** Checkbox 的受控值变化回调。 */
export type CxCheckboxChangeHandler = (checked: boolean) => void;

/** CargoX Checkbox 的公共属性。 */
export interface CxCheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** 当前是否选中。未传入时组件会根据默认值维护内部状态。 */
  checked?: boolean;
  /** 当前是否为半选状态，通常用于表格表头。 */
  indeterminate?: boolean;
  /** 非受控模式的初始值。 */
  defaultChecked?: boolean;
  /** 值变化回调。 */
  onCheckedChange?: CxCheckboxChangeHandler;
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
      indeterminate = false,
      label,
      onCheckedChange,
      onClick,
      type = "button",
      ...buttonProps
    },
    ref,
  ) {
    const [uncontrolledChecked, setUncontrolledChecked] =
      React.useState(defaultChecked);
    const checked = controlledChecked ?? uncontrolledChecked;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      const nextChecked = !checked;
      if (controlledChecked === undefined) {
        setUncontrolledChecked(nextChecked);
      }
      onCheckedChange?.(nextChecked);
      onClick?.(event);
    };

    return (
      <span
        className={cx(
          "cx-theme",
          "cx-checkbox",
          checked && "cx-checkbox--checked",
          indeterminate && "cx-checkbox--mixed",
          disabled && "cx-checkbox--disabled",
          className,
        )}
      >
        <button
          {...buttonProps}
          ref={ref}
          aria-checked={indeterminate ? "mixed" : checked}
          aria-label={buttonProps["aria-label"] ?? (typeof label === "string" ? label : undefined)}
          className="cx-checkbox__control"
          disabled={disabled}
          onClick={handleClick}
          role="checkbox"
          type={type}
        />
        <span aria-hidden="true" className="cx-checkbox__box">
          {indeterminate ? <span className="cx-checkbox__mark">−</span> : null}
          {!indeterminate && checked ? <span className="cx-checkbox__mark">✓</span> : null}
        </span>
        {label ? <span className="cx-checkbox__label">{label}</span> : null}
      </span>
    );
  },
);

Checkbox.displayName = "CargoXCheckbox";
