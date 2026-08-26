import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { cx } from "../utils";

/** fsense 基线使用的 CargoX 按钮视觉尺寸。 */
export type CxButtonCanonicalSize =
  | "xs"
  | "sm"
  | "base"
  | "medium-large"
  | "large";

/** CargoX 按钮视觉尺寸，保留独立库旧别名以便渐进迁移。 */
export type CxButtonSize = CxButtonCanonicalSize | "mediumLarge" | "ml" | "lg";

/** fsense 基线使用的 CargoX 按钮语义样式。 */
export type CxButtonCanonicalVariant =
  | "fill"
  | "danger-fill"
  | "outline"
  | "brand-outline"
  | "text";

/** CargoX 按钮语义样式，保留独立库旧别名以便渐进迁移。 */
export type CxButtonVariant =
  | CxButtonCanonicalVariant
  | "danger"
  | "brandOutline";

/** fsense 基线使用的 CargoX 按钮内容对齐方式。 */
export type CxButtonCanonicalAlign = "start" | "center";

/** CargoX 按钮内容对齐方式，`end` 是旧独立库别名。 */
export type CxButtonAlign = CxButtonCanonicalAlign | "end";

const buttonSizeClass: Record<CxButtonSize, CxButtonCanonicalSize> = {
  xs: "xs",
  sm: "sm",
  base: "base",
  "medium-large": "medium-large",
  large: "large",
  mediumLarge: "medium-large",
  ml: "medium-large",
  lg: "large",
};

const buttonVariantClass: Record<CxButtonVariant, CxButtonCanonicalVariant> = {
  fill: "fill",
  "danger-fill": "danger-fill",
  outline: "outline",
  "brand-outline": "brand-outline",
  text: "text",
  danger: "danger-fill",
  brandOutline: "brand-outline",
};

const buttonAlignClass: Record<CxButtonAlign, CxButtonCanonicalAlign> = {
  start: "start",
  center: "center",
  // fsense 的 Button 只有 start/center；旧 end 别名归一化到可用的 start 类。
  end: "start",
};

/**
 * CargoX Button 的公共属性。
 *
 * 图标插槽接受 ReactNode，因此业务应用可以继续使用自己的图标库，
 * 设计系统不会把图标实现绑定到某个应用。尺寸、变体和对齐别名会在
 * 组件内部归一化为 fsense 基线的 `cx-` 类名。
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
    const normalizedAlign = buttonAlignClass[align];
    const normalizedSize = buttonSizeClass[size];
    const normalizedVariant = buttonVariantClass[variant];

    return (
      <button
        {...buttonProps}
        ref={ref}
        className={cx(
          "cx-theme",
          "cx-button",
          `cx-button--${normalizedSize}`,
          `cx-button--${normalizedVariant}`,
          `cx-button--align-${normalizedAlign}`,
          buttonProps.disabled && "cx-button--disabled",
          className,
        )}
        type={type}
      >
        {leadingIcon ? <span className="cx-button__icon">{leadingIcon}</span> : null}
        {children}
        {trailingIcon ? <span className="cx-button__icon">{trailingIcon}</span> : null}
      </button>
    );
  },
);

Button.displayName = "CargoXButton";
