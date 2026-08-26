import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import * as React from "react";

import { cx } from "../utils";

/** CargoX Switch 的尺寸。 */
export type CxSwitchSize = "default" | "compact";

/** CargoX Switch 的公共属性。 */
export interface CxSwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** 当前开关值。未传入时组件维护内部值。 */
  checked?: boolean;
  /** 非受控模式的初始值。 */
  defaultChecked?: boolean;
  /** 值变化回调。 */
  onCheckedChange?: (checked: boolean) => void;
  /** 控件旁的说明文字。 */
  label?: ReactNode;
  /** 默认 40x20，compact 为 32x16。 */
  size?: CxSwitchSize;
}

/** CargoX Switch 组件。 */
export const Switch = forwardRef<HTMLButtonElement, CxSwitchProps>(
  function Switch(
    {
      checked: controlledChecked,
      className,
      defaultChecked = false,
      disabled,
      label,
      onCheckedChange,
      onClick,
      size = "default",
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
          "cx-switch",
          `cx-switch--${size}`,
          checked && "cx-switch--checked",
          disabled && "cx-switch--disabled",
          className,
        )}
      >
        <button
          {...buttonProps}
          ref={ref}
          aria-checked={checked}
          aria-label={buttonProps["aria-label"] ?? (typeof label === "string" ? label : undefined)}
          className="cx-switch__control"
          disabled={disabled}
          onClick={handleClick}
          role="switch"
          type={type}
        />
        <span aria-hidden="true" className="cx-switch__track">
          <span className="cx-switch__thumb" />
        </span>
        {label ? <span className="cx-switch__label">{label}</span> : null}
      </span>
    );
  },
);

Switch.displayName = "CargoXSwitch";
