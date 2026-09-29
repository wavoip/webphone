import { For, Show } from "solid-js";

type RecentNumbersDropdownProps = {
  open: boolean;
  numbers: string[];
  onSelect: (number: string) => void;
};

export function RecentNumbersDropdown(props: RecentNumbersDropdownProps) {
  return (
    <Show when={props.open && props.numbers.length > 0}>
      <ul class="wv:absolute wv:top-full wv:left-0 wv:w-full wv:mt-1 wv:z-50 wv:max-h-48 wv:overflow-y-auto wv:rounded-md wv:border wv:border-border wv:bg-popover wv:text-popover-foreground wv:shadow-md">
        <For each={props.numbers}>
          {(recent) => (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => props.onSelect(recent)}
                class="wv:w-full wv:text-center wv:px-2 wv:py-1.5 wv:text-base wv:text-popover-foreground wv:transition-colors wv:outline-none wv:hover:bg-accent wv:hover:text-accent-foreground wv:focus:bg-accent"
              >
                {recent}
              </button>
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
}
