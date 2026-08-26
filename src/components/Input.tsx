import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

import { cx } from "../utils";

/** CargoX 输入框的尺寸。 */
export type CxInputSize = "small" | "medium" | "large";

/** CargoX 输入框的校验状态。 */
export type CxInputStatus = "default" | "error";

/** fsense 基线使用的 CargoX 输入框外观模式。 */
export type CxInputCanonicalAppearance = "default" | "table-cell";

/** CargoX 输入框外观模式，保留 `tableCell` 旧别名。 */
export type CxInputAppearance = CxInputCanonicalAppearance | "tableCell";

const inputAppearanceClass: Record<
  CxInputAppearance,
  CxInputCanonicalAppearance
> = {
  default: "default",
  "table-cell": "table-cell",
  tableCell: "table-cell",
};

/**
 * CargoX Input 的公共属性。
 *
 * 输入框保持原生 input 属性，因此可直接用于表单、搜索和表格单元格。
 */
export interface CxInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "className"> {
  /** 原生 input 的额外类名。 */
  className?: string;
  /** 视觉尺寸，默认 32px medium。 */
  size?: CxInputSize;
  /** 错误状态会改变边框颜色并保留原生 aria 属性。 */
  status?: CxInputStatus;
  /** `table-cell` 去除圆角，便于嵌入可编辑单元格。 */
  appearance?: CxInputAppearance;
}

/**
 * CargoX 输入框组件。
 *
 * 组件始终返回原生 `input`，不提供会改变布局的 affix 插槽；需要图标时，
 * 由宿主在自己的布局容器中组合，以保持 fsense 的 DOM 与尺寸基线。
 */
export const Input = forwardRef<HTMLInputElement, CxInputProps>(
  function Input(
    {
      appearance = "default",
      className,
      disabled = false,
      readOnly = false,
      size = "medium",
      status = "default",
      ...inputProps
    },
    ref,
  ) {
    const stateClassName = disabled
      ? "unavailable"
      : readOnly
        ? "read-only"
        : status;

    return (
      <input
        {...inputProps}
        ref={ref}
        disabled={disabled}
        readOnly={readOnly}
        className={cx(
          "cx-theme",
          "cx-input",
          `cx-input--${size}`,
          `cx-input--${stateClassName}`,
          `cx-input--appearance-${inputAppearanceClass[appearance]}`,
          className,
        )}
      />
    );
  },
);

Input.displayName = "CargoXInput";
