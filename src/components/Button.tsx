import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { cx } from "../utils";

/** CargoX 按钮的视觉尺寸。 */
export type CxButtonSize = "xs" | "sm" | "base" | "mediumLarge" | "lg";

/** CargoX 按钮的语义样式。 */
export type CxButtonVariant =
  | "fill"
  | "danger"
  | "outline"
  | "brandOutline"
  | "text";

/** CargoX 按钮的内容对齐方式。 */
export type CxButtonAlign = "start" | "center" | "end";

/**
 * CargoX Button 的公共属性。
 *
 * 图标插槽接受 ReactNode，因此业务应用可以继续使用自己的图标库，
 * 设计系统不会把图标实现绑定到某个应用。
 */
export interface CxButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 视觉尺寸，默认使用 Figma 的 32px base 尺寸。 */
  size?: CxButtonSize;
  /** 视觉变体，默认是填充品牌按钮。 */
  variant?: CxButtonVariant;
  /** 按钮内部内容的水平对齐方式。 */
  align?: CxButtonAlign;
  /** 文案左侧的图标或自定义节点。 */
  leadingIcon?: ReactNode;
  /** 文案右侧的图标或自定义节点。 */
  trailingIcon?: ReactNode;
}

/**
 * CargoX 按钮组件。
 *
 * 组件只带有 `cx-` 前缀类名，宿主可以通过 `className` 增加布局类，
 * 但建议把布局放在宿主容器而不是覆盖组件内部样式。
 */
export const Button = forwardRef<HTMLButtonElement, CxButtonProps>(
  function Button(
    {
      align = "center",
      children,
      className,
      leadingIcon,
      size = "base",
      trailingIcon,
      type = "button",
      variant = "fill",
      ...buttonProps
    },
    ref,
  ) {
    return (
      <button
        {...buttonProps}
        ref={ref}
        className={cx(
          "cx-theme",
          "cx-button",
          `cx-button--${size}`,
          `cx-button--${variant}`,
          `cx-button--align-${align}`,
          buttonProps.disabled && "cx-button--disabled",
          className,
        )}
        type={type}
      >
        {leadingIcon ? <span className="cx-button__icon">{leadingIcon}</span> : null}
        <span className="cx-button__label">{children}</span>
        {trailingIcon ? <span className="cx-button__icon">{trailingIcon}</span> : null}
      </button>
    );
  },
);

Button.displayName = "CargoXButton";
