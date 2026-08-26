import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../utils";

/** CargoX Badge 的语义颜色。 */
export type CxBadgeStatus =
  | "important"
  | "dangerous"
  | "pending"
  | "warning"
  | "brand"
  | "positive"
  | "inactive";

/** CargoX Badge 的填充方式。 */
export type CxBadgeVariant = "filled" | "tint" | "outline";

/** CargoX Badge 的尺寸。 */
export type CxBadgeSize = "sm" | "base" | "lg";

/** CargoX Badge 的公共属性。 */
export interface CxBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 状态语义，默认 brand。 */
  status?: CxBadgeStatus;
  /** filled、tint 或 outline。 */
  variant?: CxBadgeVariant;
  /** 视觉尺寸，默认 base。 */
  size?: CxBadgeSize;
  /** 是否显示状态圆点。 */
  dot?: boolean;
  /** Badge 文案或自定义内容。 */
  children?: ReactNode;
}

/** CargoX Badge 组件。 */
export function Badge({
  children,
  className,
  dot = false,
  size = "base",
  status = "brand",
  variant = "filled",
  ...badgeProps
}: CxBadgeProps) {
  return (
    <span
      {...badgeProps}
      className={cx(
        "cx-theme",
        "cx-badge",
        `cx-badge--${status}`,
        `cx-badge--${variant}`,
        `cx-badge--${size}`,
        className,
      )}
    >
      {dot ? <span aria-hidden="true" className="cx-badge__dot" /> : null}
      {children}
    </span>
  );
}
