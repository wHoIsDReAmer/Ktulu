import type { Component, JSX } from "solid-js";

interface CardProps {
  title: string;
  actions?: JSX.Element;
  children: JSX.Element;
}

const Card: Component<CardProps> = (props) => {
  return (
    <div class="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-800 dark:bg-surface-900">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-semibold">{props.title}</h2>
        {props.actions}
      </div>
      {props.children}
    </div>
  );
};

export default Card;
