import { Portal } from "@ark-ui/react/portal";
import { Select as ArkSelect, createListCollection } from "@ark-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { useMount } from "@/providers/MountProvider";

export type SelectOption = { value: string; label: string };

type Props = {
  options: SelectOption[];
  placeholder: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

/**
 * O Ark trabalha com uma coleção, e não com filhos soltos: a lista é o dado, e a máquina
 * de estado precisa dela inteira para navegar por teclado e por digitação.
 */
function Select({ options, placeholder, value, onValueChange, className }: Props) {
  const { root } = useMount();
  const containerRef = useMemo(() => ({ current: root as HTMLElement | null }), [root]);
  const collection = useMemo(() => createListCollection({ items: options }), [options]);

  return (
    <ArkSelect.Root<SelectOption>
      data-slot="select"
      collection={collection}
      value={value === undefined ? undefined : [value]}
      onValueChange={onValueChange && ((details) => details.value[0] && onValueChange(details.value[0]))}
      lazyMount
      unmountOnExit
    >
      <ArkSelect.Control>
        <ArkSelect.Trigger
          data-slot="select-trigger"
          className={cn(
            "wv:border-input wv:data-[placeholder]:text-muted-foreground wv:focus-visible:border-ring wv:focus-visible:ring-ring/50 wv:flex wv:h-9 wv:w-fit wv:items-center wv:justify-between wv:gap-2 wv:rounded-md wv:border wv:bg-transparent wv:px-3 wv:py-2 wv:text-sm wv:whitespace-nowrap wv:shadow-xs wv:transition-[color,box-shadow] wv:outline-none wv:focus-visible:ring-[3px] wv:disabled:cursor-not-allowed wv:disabled:opacity-50",
            className,
          )}
        >
          <ArkSelect.ValueText placeholder={placeholder} />
          <ArkSelect.Indicator>
            <ChevronDownIcon className="wv:size-4 wv:opacity-50" />
          </ArkSelect.Indicator>
        </ArkSelect.Trigger>
      </ArkSelect.Control>

      <Portal container={containerRef}>
        <ArkSelect.Positioner>
          <ArkSelect.Content
            data-slot="select-content"
            className="wv:bg-popover wv:text-popover-foreground wv:data-[state=open]:animate-in wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=open]:fade-in-0 wv:z-50 wv:max-h-72 wv:min-w-32 wv:overflow-y-auto wv:rounded-md wv:border wv:p-1 wv:shadow-md"
          >
            {options.map((option) => (
              <ArkSelect.Item
                key={option.value}
                item={option}
                data-slot="select-item"
                className="wv:relative wv:flex wv:w-full wv:cursor-default wv:items-center wv:gap-2 wv:rounded-sm wv:py-1.5 wv:pr-8 wv:pl-2 wv:text-sm wv:outline-hidden wv:select-none wv:data-[highlighted]:bg-accent wv:data-[highlighted]:text-accent-foreground wv:data-[disabled]:pointer-events-none wv:data-[disabled]:opacity-50"
              >
                <ArkSelect.ItemText>{option.label}</ArkSelect.ItemText>
                <ArkSelect.ItemIndicator className="wv:absolute wv:right-2 wv:flex wv:size-3.5 wv:items-center wv:justify-center">
                  <CheckIcon className="wv:size-4" />
                </ArkSelect.ItemIndicator>
              </ArkSelect.Item>
            ))}
          </ArkSelect.Content>
        </ArkSelect.Positioner>
      </Portal>
      <ArkSelect.HiddenSelect />
    </ArkSelect.Root>
  );
}

export { Select };
