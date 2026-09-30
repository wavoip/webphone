import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps, splitProps } from "solid-js";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const fieldVariants = cva(
  "wv:group/field wv:flex wv:w-full wv:gap-3 wv:data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
        responsive: [
          "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

function FieldSet(props: ComponentProps<"fieldset">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <fieldset
      data-slot="field-set"
      class={cn(
        "wv:flex wv:flex-col wv:gap-6",
        "wv:has-[>[data-slot=checkbox-group]]:gap-3 wv:has-[>[data-slot=radio-group]]:gap-3",
        local.class,
      )}
      {...rest}
    />
  );
}

function FieldGroup(props: ComponentProps<"div">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="field-group"
      class={cn(
        "wv:group/field-group wv:@container/field-group wv:flex wv:w-full wv:flex-col wv:gap-7 wv:data-[slot=checkbox-group]:gap-3 wv:[&>[data-slot=field-group]]:gap-4",
        local.class,
      )}
      {...rest}
    />
  );
}

type FieldProps = ComponentProps<"div"> & VariantProps<typeof fieldVariants>;

function Field(props: FieldProps) {
  const [local, rest] = splitProps(props, ["class", "orientation"]);
  const orientation = () => local.orientation ?? "vertical";
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation()}
      class={cn(fieldVariants({ orientation: orientation() }), local.class)}
      {...rest}
    />
  );
}

function FieldLabel(props: ComponentProps<typeof Label>) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <Label
      data-slot="field-label"
      class={cn(
        "wv:group/field-label wv:peer/field-label wv:flex wv:w-fit wv:gap-2 wv:leading-snug wv:group-data-[disabled=true]/field:opacity-50",
        "wv:has-[>[data-slot=field]]:w-full wv:has-[>[data-slot=field]]:flex-col wv:has-[>[data-slot=field]]:rounded-md wv:has-[>[data-slot=field]]:border wv:[&>*]:data-[slot=field]:p-4",
        "wv:has-data-[state=checked]:bg-primary/5 wv:has-data-[state=checked]:border-primary wv:dark:has-data-[state=checked]:bg-primary/10",
        local.class,
      )}
      {...rest}
    />
  );
}

function FieldDescription(props: ComponentProps<"p">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <p
      data-slot="field-description"
      class={cn(
        "wv:text-muted-foreground wv:text-sm wv:leading-normal wv:font-normal wv:group-has-[[data-orientation=horizontal]]/field:text-balance",
        "wv:last:mt-0 wv:nth-last-2:-mt-1 wv:[[data-variant=legend]+&]:-mt-1.5",
        "wv:[&>a:hover]:text-primary wv:[&>a]:underline wv:[&>a]:underline-offset-4",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet };
