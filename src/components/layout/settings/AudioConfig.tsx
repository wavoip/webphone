import type { AudioDevice } from "@wavoip/wavoip-api/web";
import { useEffect, useState } from "react";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Select, type SelectOption } from "@/components/ui/select";
import { t } from "@/lib/i18n";

/** O rótulo vem vazio até a permissão do microfone sair; o `id` é o que sempre existe. */
function toOption(device: AudioDevice): SelectOption {
  return { value: device.id, label: device.label || device.id };
}

export function AudioConfig() {
  const wavoip = useMiddleware().wavoip;

  const [microphones, setMicrophones] = useState<SelectOption[]>([]);
  const [speakers, setSpeakers] = useState<SelectOption[]>([]);

  useEffect(() => {
    setMicrophones(wavoip.audio.listInputDevices().map(toOption));
    setSpeakers(wavoip.audio.listOutputDevices().map(toOption));
  }, [wavoip]);

  return (
    <div className=" wv:py-3">
      <FieldSet>
        <FieldGroup className="wv:flex wv:flex-col wv:gap-4">
          <Field className="wv:flex wv:flex-col wv:gap-1 wv:text-foreground">
            <FieldLabel>{t("Microphone")}</FieldLabel>
            <Select options={microphones} placeholder={t("Microphone")} className="wv:max-w-[300px]" />
            <FieldDescription>{t("Select the microphone to use on calls")}</FieldDescription>
          </Field>

          <Field className="wv:flex wv:flex-col wv:gap-1 wv:text-foreground">
            <FieldLabel>{t("Speaker")}</FieldLabel>
            <Select options={speakers} placeholder={t("Speaker")} className="wv:max-w-[300px]" />
            <FieldDescription>{t("Select the speaker to use on calls")}</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
