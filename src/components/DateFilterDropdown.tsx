import { useMemo, useState } from "react";

import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Switch } from "./Switch";

const chevronLeftIcon = new URL(
  "../assets/icons/filter-chevron-left.svg",
  import.meta.url,
).href;
const chevronRightIcon = new URL(
  "../assets/icons/filter-chevron-right.svg",
  import.meta.url,
).href;

/** 日期筛选值；空字符串表示未设置边界。 */
export interface FilterDateRange {
  from: string;
  to: string;
}

/** 日期筛选菜单属性。 */
export interface DateFilterDropdownProps {
  dateRange: FilterDateRange;
  onDateRangeChange: (nextRange: FilterDateRange) => void;
}

const weekdayLabelList = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toIsoDate(year: number, monthIndex: number, dayOfMonth: number): string {
  const monthText = String(monthIndex + 1).padStart(2, "0");
  const dayText = String(dayOfMonth).padStart(2, "0");
  return `${year}-${monthText}-${dayText}`;
}

/** Document Station 原 280×328 日期菜单，业务只负责保存日期范围。 */
export function DateFilterDropdown({ dateRange, onDateRangeChange }: DateFilterDropdownProps) {
  const initialDate = dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [rangeEnabled, setRangeEnabled] = useState(true);
  const calendarCellList = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const monthIndex = visibleMonth.getMonth();
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    return Array.from({ length: 42 }, (_, cellIndex) => {
      const dateValue = new Date(year, monthIndex, cellIndex - firstWeekday + 1);
      return {
        isoDate: toIsoDate(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate()),
        dayOfMonth: dateValue.getDate(),
        belongsToVisibleMonth: dateValue.getMonth() === monthIndex,
      };
    });
  }, [visibleMonth]);

  function selectDate(isoDate: string): void {
    if (!rangeEnabled) {
      onDateRangeChange({ from: isoDate, to: isoDate });
      return;
    }
    if (!dateRange.from || dateRange.to) {
      onDateRangeChange({ from: isoDate, to: "" });
      return;
    }
    onDateRangeChange(isoDate < dateRange.from ? { from: isoDate, to: dateRange.from } : { from: dateRange.from, to: isoDate });
  }

  return (
    <div className="cx-theme cx-filter-date" role="menu">
      <div className="cx-filter-date__header">
        <IconButton aria-label="Previous month" className="cx-filter-date__nav" icon={<img alt="" src={chevronLeftIcon} />} onClick={() => setVisibleMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} variant="brand-icon" />
        <strong>{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(visibleMonth)}</strong>
        <IconButton aria-label="Next month" className="cx-filter-date__nav" icon={<img alt="" src={chevronRightIcon} />} onClick={() => setVisibleMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} variant="brand-icon" />
      </div>
      <div className="cx-filter-date__calendar">
        {weekdayLabelList.map((weekdayLabel) => <strong key={weekdayLabel}>{weekdayLabel}</strong>)}
        {calendarCellList.map((calendarCell) => {
          const isSelected = calendarCell.isoDate === dateRange.from || calendarCell.isoDate === dateRange.to;
          const isInRange = Boolean(dateRange.from && dateRange.to && calendarCell.isoDate > dateRange.from && calendarCell.isoDate < dateRange.to);
          return (
            <button
              className={`cx-filter-date__day ${isSelected ? "cx-filter-date__day--selected" : isInRange ? "cx-filter-date__day--range" : calendarCell.belongsToVisibleMonth ? "" : "cx-filter-date__day--outside"}`}
              key={calendarCell.isoDate}
              onClick={() => selectDate(calendarCell.isoDate)}
              type="button"
            >
              {calendarCell.dayOfMonth}
            </button>
          );
        })}
      </div>
      <div className="cx-filter-date__footer">
        <div className="cx-filter-date__range-toggle">
          <span>Date range</span>
          <Switch checked={rangeEnabled} label="Date range" onCheckedChange={setRangeEnabled} />
        </div>
        <Button className="cx-filter-date__clear" onClick={() => onDateRangeChange({ from: "", to: "" })} size="sm" variant="outline">Clear</Button>
      </div>
    </div>
  );
}
