import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type CSSProperties, type ReactNode } from "react";

import { IconButton } from "./IconButton";
import { cx } from "../utils";

const dragPointDotIcon = new URL(
  "../assets/icons/drag-point-dot.svg",
  import.meta.url,
).href;

/** 可排序列表的通用拖动上下文属性。 */
export interface SortableListProps<T extends UniqueIdentifier> {
  items: T[];
  onItemsChange: (items: T[]) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * CargoX 共享垂直排序容器。
 * Pointer、Space/Arrow 键和 Escape 均由 dnd-kit 管理，取消拖动不会关闭外层弹窗。
 */
export function SortableList<T extends UniqueIdentifier>({
  children,
  className,
  disabled = false,
  items,
  onItemsChange,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(active.id as T);
    const newIndex = items.indexOf(over.id as T);
    if (oldIndex < 0 || newIndex < 0) return;
    onItemsChange(arrayMove(items, oldIndex, newIndex));
  }
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={disabled ? undefined : sensors}
    >
      <SortableContext disabled={disabled} items={items} strategy={verticalListSortingStrategy}>
        <div className={className}>{children}</div>
      </SortableContext>
    </DndContext>
  );
}

/** SortableList 的一行通用壳，内容和尾部操作由消费者提供。 */
export interface SortableRowProps {
  id: UniqueIdentifier;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  label?: string;
  endAdornment?: ReactNode;
  handlePosition?: "start" | "end";
  style?: CSSProperties;
}

export function SortableRow({
  children,
  className,
  disabled = false,
  endAdornment,
  handlePosition = "start",
  id,
  label = "Reorder item",
  style,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    disabled,
    id,
  });
  const dragHandle = (
    <IconButton
      aria-label={label}
      className="cx-sortable-row__handle"
      disabled={disabled}
      {...attributes}
      {...listeners}
      icon={(
        <span aria-hidden="true" className="cx-sortable-row__dots">
          {Array.from({ length: 6 }, (_, dotIndex) => <img alt="" key={dotIndex} src={dragPointDotIcon} />)}
        </span>
      )}
      variant="regular-icon"
    />
  );
  return (
    <div
      className={cx("cx-theme", "cx-sortable-row", isDragging && "cx-sortable-row--dragging", className)}
      ref={setNodeRef}
      style={{ ...style, transform: CSS.Transform.toString(transform), transition }}
    >
      {handlePosition === "start" ? dragHandle : null}
      <div className="cx-sortable-row__content">{children}</div>
      {handlePosition === "end" ? dragHandle : null}
      {endAdornment ? <div className="cx-sortable-row__end">{endAdornment}</div> : null}
    </div>
  );
}
