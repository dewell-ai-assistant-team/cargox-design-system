import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";

import { cx } from "../utils";

/** CargoX Select 的视觉尺寸。 */
export type CxSelectSize = "small" | "medium" | "large";

/** CargoX SelectTrigger 的校验状态。 */
export type CxSelectStatus = "default" | "error";

/** CargoX Select 容器的公共属性。 */
export interface CxSelectProps extends HTMLAttributes<HTMLDivElement> {}

/** CargoX SelectTrigger 的公共属性。 */
export interface CxSelectTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size" | "className"> {
  /** 原生 button 的额外类名。 */
  className?: string;
  /** 视觉尺寸，默认 32px medium。 */
  size?: CxSelectSize;
  /** 错误状态会改变边框颜色。 */
  status?: CxSelectStatus;
}

/**
 * CargoX Select 的轻量组合容器。
 *
 * 菜单与业务状态由宿主控制，容器只提供组合与 blur 边界。
 */
export const Select = forwardRef<HTMLDivElement, CxSelectProps>(
  function Select({ children, className, ...selectProps }, ref) {
    return (
      <div
        {...selectProps}
        ref={ref}
        className={cx("cx-theme", "cx-select", className)}
      >
        {children}
      </div>
    );
  },
);

Select.displayName = "CargoXSelect";

/**
 * CargoX Select 的原生 button trigger。
 *
 * aria-expanded、aria-haspopup 和菜单事件保持原生属性与宿主控制。
 */
export const SelectTrigger = forwardRef<
  HTMLButtonElement,
  CxSelectTriggerProps
>(
  function SelectTrigger(
    {
      children,
      className,
      disabled = false,
      size = "medium",
      status = "default",
      type = "button",
      ...buttonProps
    },
    ref,
  ) {
    const stateClassName = disabled ? "unavailable" : status;

    return (
      <button
        {...buttonProps}
        ref={ref}
        className={cx(
          "cx-theme",
          "cx-select-trigger",
          `cx-select-trigger--${size}`,
          `cx-select-trigger--${stateClassName}`,
          className,
        )}
        disabled={disabled}
        type={type}
      >
        {children}
      </button>
    );
  },
);

SelectTrigger.displayName = "CargoXSelectTrigger";
