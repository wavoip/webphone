type RecentNumbersDropdownProps = {
  numbers: string[];
  onSelect: (number: string) => void;
};

export function RecentNumbersDropdown({ numbers, onSelect }: RecentNumbersDropdownProps) {
  return (
    <ul className="wv:absolute wv:top-full wv:left-0 wv:w-full wv:mt-1 wv:z-50 wv:max-h-48 wv:overflow-y-auto wv:rounded-md wv:border wv:border-border wv:bg-popover wv:text-popover-foreground wv:shadow-md">
      {numbers.map((recent) => (
        <li key={recent}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(recent)}
            className="wv:w-full wv:text-center wv:px-2 wv:py-1.5 wv:text-base wv:text-popover-foreground wv:transition-colors wv:outline-none wv:hover:bg-accent wv:hover:text-accent-foreground wv:focus:bg-accent"
          >
            {recent}
          </button>
        </li>
      ))}
    </ul>
  );
}