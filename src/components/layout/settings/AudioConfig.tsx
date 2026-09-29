import type { AudioDevice } from "@wavoip/wavoip-api/web";
import { useEffect, useState } from "react";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n";
import { useWavoip } from "@/providers/WavoipProvider";

export function AudioConfig() {
  const { wavoip } = useWavoip();

  const [microphones, setMicrophones] = useState<AudioDevice[]>([]);
  const [speakers, setSpeakers] = useState<AudioDevice[]>([]);

  useEffect(() => {
    setMicrophones(wavoip.audio.listInputDevices());
    setSpeakers(wavoip.audio.listOutputDevices());
  }, [wavoip]);

  return (
    <div className=" wv:py-3">
      <FieldSet>
        <FieldGroup className="wv:flex wv:flex-col wv:gap-4">
          <Field className="wv:flex wv:flex-col wv:gap-1 wv:text-foreground">
            <FieldLabel>{t("Microphone")}</FieldLabel>
            <Select>
              <SelectTrigger className="wv:max-w-[300px]">
                <SelectValue placeholder="Choose department" />
              </SelectTrigger>
              <SelectContent>
                {microphones.map((device, index) => (
                  <SelectItem value={device.id} key={`microphone_${device.id || index}`}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>{t("Select the microphone to use on calls")}</FieldDescription>
          </Field>

          <Field className="wv:flex wv:flex-col wv:gap-1 wv:text-foreground">
            <FieldLabel>{t("Speaker")}</FieldLabel>
            <Select>
              <SelectTrigger className="wv:max-w-[300px]">
                <SelectValue placeholder="Choose department" />
              </SelectTrigger>
              <SelectContent>
                {speakers.map((device, index) => (
                  <SelectItem value={device.id} key={`speaker_${device.id || index}`}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>{t("Select the speaker to use on calls")}</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
