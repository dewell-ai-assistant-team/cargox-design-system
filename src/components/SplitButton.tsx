import {
  createContext,
  forwardRef,
  useContext,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import splitChevronDisabled from "../assets/icons/cargox-split-chevron-disabled.svg";
import splitChevronFill from "../assets/icons/cargox-split-chevron-fill.svg";
import splitChevronOutline from "../assets/icons/cargox-split-chevron-outline.svg";
import { cx } from "../utils";
import type { CxAccessibleButtonName } from "./IconButton";

export type SplitButtonVariant = "fill" | "outline";
export type SplitButtonSize = "lg" | "sm";

interface SplitButtonContextValue {
  disabled: boolean;
  size: SplitButtonSize;
  variant: SplitButtonVariant;
}

const SplitButtonContext = createContext<SplitButtonContextValue>({
  disabled: false,
  size: "lg",
  variant: "fill",
});

export interface SplitButtonProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  disabled?: boolean;
  size?: SplitButtonSize;
  variant?: SplitButtonVariant;
}

export const SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>(
  function SplitButton(
    {
      children,
      className,
      disabled = false,
      size = "lg",
      variant = "fill",
      ...groupProps
    },
    ref,
  ) {
    return (
      <SplitButtonContext.Provider value={{ disabled, size, variant }}>
        <div
          {...groupProps}
          ref={ref}
          className={cx(
            "cx-theme",
            "cx-split-button",
            `cx-split-button--${variant}`,
            `cx-split-button--${size}`,
            disabled && "cx-split-button--disabled",
            className,
          )}
          role="group"
        >
          {children}
        </div>
      </SplitButtonContext.Provider>
    );
  },
);

SplitButton.displayName = "CargoXSplitButton";

export interface SplitButtonActionProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  leadingIcon?: ReactNode;
}

export const SplitButtonAction = forwardRef<
  HTMLButtonElement,
  SplitButtonActionProps
>(function SplitButtonAction(
  {
    children,
    className,
    disabled: childDisabled = false,
    leadingIcon,
    type = "button",
    ...buttonProps
  },
  ref,
) {
  const { disabled: groupDisabled } = useContext(SplitButtonContext);

  return (
    <button
      {...buttonProps}
      ref={ref}
      className={cx("cx-split-button__action", className)}
      disabled={groupDisabled || childDisabled}
      type={type}
    >
      {leadingIcon ? (
        <span aria-hidden="true" className="cx-split-button__action-icon">
          {leadingIcon}
        </span>
      ) : null}
      {children}
    </button>
  );
});

SplitButtonAction.displayName = "CargoXSplitButtonAction";

type NativeSplitButtonTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "aria-labelledby" | "children"
>;

export type SplitButtonTriggerProps = NativeSplitButtonTriggerProps &
  CxAccessibleButtonName & {
    icon?: ReactNode;
  };

export const SplitButtonTrigger = forwardRef<
  HTMLButtonElement,
  SplitButtonTriggerProps
>(function SplitButtonTrigger(
  {
    className,
    disabled: childDisabled = false,
    icon,
    type = "button",
    ...buttonProps
  },
  ref,
) {
  const {
    disabled: groupDisabled,
    variant,
  } = useContext(SplitButtonContext);
  const disabled = groupDisabled || childDisabled;
  const chevron = disabled
    ? splitChevronDisabled
    : variant === "outline"
      ? splitChevronOutline
      : splitChevronFill;

  return (
    <button
      {...buttonProps}
      ref={ref}
      className={cx("cx-split-button__trigger", className)}
      disabled={disabled}
      type={type}
    >
      <span aria-hidden="true" className="cx-split-button__trigger-icon">
        {icon ?? <img alt="" src={chevron} />}
      </span>
    </button>
  );
});

SplitButtonTrigger.displayName = "CargoXSplitButtonTrigger";
