import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { cx } from "../utils";

/** CargoX 输入框的尺寸。 */
export type CxInputSize = "small" | "medium" | "large";

/** CargoX 输入框的校验状态。 */
export type CxInputStatus = "default" | "error";

/** CargoX 输入框的外观模式。 */
export type CxInputAppearance = "default" | "tableCell";

/**
 * CargoX Input 的公共属性。
 *
 * 输入框保持原生 input 属性，因此可直接用于表单、搜索和表格单元格。
 */
export interface CxInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "className"> {
  /** 输入框外层的额外类名。 */
  className?: string;
  /** 视觉尺寸，默认 32px medium。 */
  size?: CxInputSize;
  /** 错误状态会改变边框颜色并保留原生 aria 属性。 */
  status?: CxInputStatus;
  /** `tableCell` 去除外层圆角，便于嵌入可编辑单元格。 */
  appearance?: CxInputAppearance;
  /** 输入框左侧的图标或自定义节点。 */
  leadingIcon?: ReactNode;
  /** 输入框右侧的图标或自定义节点。 */
  trailingIcon?: ReactNode;
}

/** CargoX 输入框组件。 */
export const Input = forwardRef<HTMLInputElement, CxInputProps>(
  function Input(
    {
      appearance = "default",
      className,
      leadingIcon,
      size = "medium",
      status = "default",
      trailingIcon,
      ...inputProps
    },
    ref,
  ) {
    return (
      <span
        className={cx(
          "cx-theme",
          "cx-input-shell",
          `cx-input-shell--${appearance}`,
          `cx-input-shell--${size}`,
          `cx-input-shell--${status}`,
          inputProps.disabled && "cx-input-shell--disabled",
          className,
        )}
      >
        {leadingIcon ? <span className="cx-input__affix">{leadingIcon}</span> : null}
        <input
          {...inputProps}
          ref={ref}
          className={cx("cx-input", `cx-input--${size}`)}
        />
        {trailingIcon ? <span className="cx-input__affix">{trailingIcon}</span> : null}
      </span>
    );
  },
);

Input.displayName = "CargoXInput";
