import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { cx } from "../utils";

/** CargoX TextButton 的视觉尺寸。 */
export type CxTextButtonSize = "small" | "large";

/** CargoX TextButton 的主题。 */
export type CxTextButtonTheme = "default" | "ai";

/** CargoX TextButton 的公共属性。 */
export interface CxTextButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 视觉尺寸，默认使用 20px 高度的 small 尺寸。 */
  size?: CxTextButtonSize;
  /** 视觉主题，默认使用品牌文字主题。 */
  theme?: CxTextButtonTheme;
  /** 文案左侧的图标或自定义节点。 */
  leadingIcon?: ReactNode;
  /** 文案右侧的图标或自定义节点。 */
  trailingIcon?: ReactNode;
}

/**
 * CargoX TextButton 组件。
 *
 * TextButton 的尺寸与 Button 独立，适用于工具栏和轻量级文本操作；图标
 * 插槽接受 ReactNode，因此宿主应用可以继续复用自己的图标实现。
 */
export const TextButton = forwardRef<HTMLButtonElement, CxTextButtonProps>(
  function TextButton(
    {
      children,
      className,
      leadingIcon,
      size = "small",
      theme = "default",
      trailingIcon,
      type = "button",
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
          "cx-text-button",
          `cx-text-button--${size}`,
          `cx-text-button--${theme}`,
          className,
        )}
        type={type}
      >
        {leadingIcon ? (
          <span aria-hidden="true" className="cx-text-button__icon">
            {leadingIcon}
          </span>
        ) : null}
        <span className="cx-text-button__label">{children}</span>
        {trailingIcon ? (
          <span aria-hidden="true" className="cx-text-button__icon">
            {trailingIcon}
          </span>
        ) : null}
      </button>
    );
  },
);

TextButton.displayName = "CargoXTextButton";
