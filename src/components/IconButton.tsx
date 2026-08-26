import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { cx } from "../utils";

export type CxAccessibleButtonName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

export type IconButtonVariant = "brand-icon" | "regular-icon";

type NativeIconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "aria-labelledby" | "children"
>;

export type IconButtonProps = NativeIconButtonProps &
  CxAccessibleButtonName & {
    icon: ReactNode;
    variant?: IconButtonVariant;
  };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      className,
      icon,
      type = "button",
      variant = "brand-icon",
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
          "cx-icon-button",
          `cx-icon-button--${variant}`,
          className,
        )}
        type={type}
      >
        <span aria-hidden="true" className="cx-icon-button__icon">
          {icon}
        </span>
      </button>
    );
  },
);

IconButton.displayName = "CargoXIconButton";
