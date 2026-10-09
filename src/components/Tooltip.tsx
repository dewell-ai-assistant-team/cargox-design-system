import {
  arrow as arrowMiddleware,
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  type Placement,
} from "@floating-ui/react";
import {
  cloneElement,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { cx } from "../utils";

export type TooltipTheme = "light" | "dark";
export type CxTooltipTheme = TooltipTheme;
export type TooltipArrowPosition =
  | "above-start"
  | "above-center"
  | "above-end"
  | "below-start"
  | "below-center"
  | "below-end"
  | "before-top"
  | "before-center"
  | "before-bottom"
  | "after-top"
  | "after-center"
  | "after-bottom"
  | "none";
export type CxTooltipArrowPosition = TooltipArrowPosition;

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  theme?: TooltipTheme;
  arrowPosition?: TooltipArrowPosition;
  children?: ReactNode;
}
export type CxTooltipContentProps = TooltipContentProps;

interface TooltipContentInternalProps extends TooltipContentProps {
  arrowRef?: Ref<HTMLSpanElement>;
  arrowStyle?: CSSProperties;
}

const TooltipContentImpl = forwardRef<HTMLDivElement, TooltipContentInternalProps>(
  function TooltipContentImpl(
    {
      arrowPosition = "above-center",
      arrowRef,
      arrowStyle,
      children,
      className,
      theme = "dark",
      ...contentProps
    },
    ref,
  ) {
    return (
      <div
        {...contentProps}
        ref={ref}
        role="tooltip"
        data-arrow-position={arrowPosition}
        className={cx("cx-theme", "cx-tooltip", `cx-tooltip--${theme}`, className)}
      >
        <span className="cx-tooltip__label">{children}</span>
        {arrowPosition !== "none" ? (
          <span
            ref={arrowRef}
            className="cx-tooltip__arrow"
            style={arrowStyle}
            aria-hidden="true"
          />
        ) : null}
      </div>
    );
  },
);

/** Standalone tooltip surface for authored or externally positioned content. */
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(props, ref) {
    return <TooltipContentImpl {...props} ref={ref} />;
  },
);

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  theme?: TooltipTheme;
  placement?: Placement;
  arrow?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}
export type CxTooltipProps = TooltipProps;

function arrowPositionForPlacement(placement: Placement): TooltipArrowPosition {
  const [side, alignment] = placement.split("-");
  const aligned = alignment === "start" || alignment === "end" ? alignment : "center";

  if (side === "top" || side === "bottom") {
    return `${side === "top" ? "below" : "above"}-${aligned}` as TooltipArrowPosition;
  }

  const vertical = alignment === "start" ? "top" : alignment === "end" ? "bottom" : "center";
  return `${side === "left" ? "after" : "before"}-${vertical}` as TooltipArrowPosition;
}

/** One trigger element; disabled controls receive a span trigger. */
export function Tooltip({
  arrow = true,
  children,
  className,
  content,
  defaultOpen = false,
  delay = 300,
  disabled = false,
  onOpenChange,
  open: controlledOpen,
  placement = "top",
  style,
  theme = "dark",
}: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const id = useId();
  const isOpen = !disabled && (controlledOpen ?? uncontrolledOpen);

  useEffect(() => {
    if (disabled && controlledOpen === undefined) setUncontrolledOpen(false);
  }, [controlledOpen, disabled]);

  const { context, refs, floatingStyles, middlewareData, placement: resolvedPlacement } = useFloating({
    open: isOpen,
    onOpenChange(nextOpen) {
      if (disabled) return;
      if (controlledOpen === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    placement,
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(arrow ? 12 : 4),
      flip(),
      shift({ padding: 4 }),
      ...(arrow ? [arrowMiddleware({ element: arrowRef, padding: 4 })] : []),
    ],
  });

  const hover = useHover(context, {
    enabled: !disabled,
    delay: { open: delay, close: 0 },
    handleClose: safePolygon(),
  });
  const focus = useFocus(context, { enabled: !disabled });
  const dismiss = useDismiss(context, { enabled: !disabled });
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const child = children as ReactElement<HTMLAttributes<HTMLElement> & { disabled?: boolean; ref?: Ref<HTMLElement> }>;
  const childDisabled = child.props.disabled === true;
  const existingDescription = child.props["aria-describedby"];
  const describedBy = isOpen
    ? [existingDescription, id].filter(Boolean).join(" ")
    : existingDescription;
  const mergedRef = useMergeRefs([refs.setReference, childDisabled ? null : child.props.ref]);

  const reference = childDisabled ? (
    <span
      {...getReferenceProps({
        "aria-describedby": describedBy,
        tabIndex: child.props.tabIndex ?? 0,
      })}
      ref={mergedRef}
      style={{ display: "inline-flex" }}
    >
      {child}
    </span>
  ) : (
    cloneElement(child, {
      ...getReferenceProps(child.props),
      "aria-describedby": describedBy,
      ref: mergedRef,
    })
  );

  const arrowStyle: CSSProperties = {
    left: middlewareData.arrow?.x == null ? undefined : `${middlewareData.arrow.x}px`,
    top: middlewareData.arrow?.y == null ? undefined : `${middlewareData.arrow.y}px`,
  };

  return (
    <>
      {reference}
      {isOpen && typeof document !== "undefined" ? (
        <FloatingPortal>
          <TooltipContentImpl
            {...getFloatingProps()}
            ref={refs.setFloating}
            arrowRef={arrow ? arrowRef : undefined}
            arrowStyle={arrowStyle}
            arrowPosition={arrow ? arrowPositionForPlacement(resolvedPlacement) : "none"}
            theme={theme}
            className={className}
            id={id}
            style={{ ...style, ...floatingStyles }}
          >
            {content}
          </TooltipContentImpl>
        </FloatingPortal>
      ) : null}
    </>
  );
}
