import type { Component } from "solid-js";

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  formatValue?: (v: number) => string;
  color?: string;
}

const ProgressBar: Component<ProgressBarProps> = (props) => {
  const percentage = () =>
    props.max > 0 ? Math.round((props.value / props.max) * 100) : 0;
  const barColor = () => props.color ?? "bg-accent-500";
  const fmt = (v: number) =>
    props.formatValue ? props.formatValue(v) : `${v}${props.unit ?? ""}`;

  return (
    <div>
      <div class="mb-2 flex justify-between text-sm">
        <span class="font-medium text-surface-600 dark:text-surface-400">
          {props.label}
        </span>
        <span class="tabular-nums text-surface-500 dark:text-surface-500">
          {fmt(props.value)} / {fmt(props.max)} ({percentage()}%)
        </span>
      </div>
      <div class="h-2.5 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800">
        <div
          class={`h-full rounded-full transition-all duration-700 ease-out ${barColor()}`}
          style={{ width: `${percentage()}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
