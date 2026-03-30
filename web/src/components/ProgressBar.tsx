import type { Component } from "solid-js";

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color?: string;
}

const ProgressBar: Component<ProgressBarProps> = (props) => {
  const percentage = () => Math.round((props.value / props.max) * 100);
  const barColor = () => props.color ?? "bg-accent-500";

  return (
    <div>
      <div class="mb-2 flex justify-between text-sm">
        <span class="font-medium text-surface-600 dark:text-surface-400">
          {props.label}
        </span>
        <span class="tabular-nums text-surface-500 dark:text-surface-500">
          {props.value}
          {props.unit} / {props.max}
          {props.unit} ({percentage()}%)
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
