import { Select as ArkSelect, createListCollection } from "@ark-ui/solid/select";
import { createMemo, For } from "solid-js";
import { Portal } from "solid-js/web";

import { CaretDown, Check } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useMount } from "@/providers/MountProvider";

export type SelectOption = { value: string; label: string };

type Props = {
  options: SelectOption[];
  placeholder: string;
  value?: string;
  onValueChange?: (value: string) => void;
  class?: string;
};

/**
 * O Ark trabalha com uma coleção, e não com filhos soltos: a lista é o dado, e a máquina
 * de estado precisa dela inteira para navegar por teclado e por digitação.
 */
function Select(props: Props) {
  const { root } = useMount();
  const collection = createMemo(() => createListCollection({ items: props.options }));

  return (
    <ArkSelect.Root
      data-slot="select"
      collection={collection()}
      value={props.value === undefined ? undefined : [props.value]}
      onValueChange={(details) => details.value[0] && props.onValueChange?.(details.value[0])}
      lazyMount
      unmountOnExit
    >
      <ArkSelect.Control>
        <ArkSelect.Trigger
          data-slot="select-trigger"
          class={cn(
            "wv:border-input wv:data-[placeholder]:text-muted-foreground wv:focus-visible:border-ring wv:focus-visible:ring-ring/50 wv:flex wv:h-9 wv:w-fit wv:items-center wv:justify-between wv:gap-2 wv:rounded-md wv:border wv:bg-transparent wv:px-3 wv:py-2 wv:text-sm wv:whitespace-nowrap wv:shadow-xs wv:outline-none wv:focus-visible:ring-[3px] wv:disabled:cursor-not-allowed wv:disabled:opacity-50",
            props.class,
          )}
        >
          <ArkSelect.ValueText placeholder={props.placeholder} />
          <ArkSelect.Indicator>
            <CaretDown class="wv:size-4 wv:opacity-50" />
          </ArkSelect.Indicator>
        </ArkSelect.Trigger>
      </ArkSelect.Control>

      <Portal mount={root}>
        <ArkSelect.Positioner>
          <ArkSelect.Content
            data-slot="select-content"
            class="wv:bg-popover wv:text-popover-foreground wv:z-50 wv:max-h-72 wv:min-w-32 wv:overflow-y-auto wv:rounded-md wv:border wv:p-1 wv:shadow-md"
          >
            <For each={props.options}>
              {(option) => (
                <ArkSelect.Item
                  item={option}
                  data-slot="select-item"
                  class="wv:relative wv:flex wv:w-full wv:cursor-default wv:items-center wv:gap-2 wv:rounded-sm wv:py-1.5 wv:pr-8 wv:pl-2 wv:text-sm wv:outline-hidden wv:select-none wv:data-[highlighted]:bg-accent wv:data-[highlighted]:text-accent-foreground wv:data-[disabled]:pointer-events-none wv:data-[disabled]:opacity-50"
                >
                  <ArkSelect.ItemText>{option.label}</ArkSelect.ItemText>
                  <ArkSelect.ItemIndicator class="wv:absolute wv:right-2 wv:flex wv:size-3.5 wv:items-center wv:justify-center">
                    <Check class="wv:size-4" />
                  </ArkSelect.ItemIndicator>
                </ArkSelect.Item>
              )}
            </For>
          </ArkSelect.Content>
        </ArkSelect.Positioner>
      </Portal>
      <ArkSelect.HiddenSelect />
    </ArkSelect.Root>
  );
}

export { Select };
