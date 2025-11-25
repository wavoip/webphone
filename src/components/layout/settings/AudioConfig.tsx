import type { MultimediaDevice } from "@wavoip/wavoip-api";
import { useEffect, useState } from "react";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWavoip } from "@/providers/WavoipProvider";

export function AudioConfig() {
    const { wavoip } = useWavoip();
    const [microphones, setMicrophones] = useState<MultimediaDevice[]>([]);
    const [speakers, setSpeakers] = useState<MultimediaDevice[]>([]);

    useEffect(() => {
        if (wavoip) {
            const devices = wavoip.getMultimediaDevices();
            setMicrophones(devices.microphones);
            setSpeakers(devices.speakers);
        }
    }, []);

    return (
        <div className=" wv:py-3">
            <FieldSet>
                <FieldGroup className="wv:flex wv:flex-col wv:gap-4">
                    <Field className="wv:flex wv:flex-col wv:gap-1 wv:text-foreground">
                        <FieldLabel>Microfone</FieldLabel>
                        <Select>
                            <SelectTrigger className="wv:max-w-[300px]">
                                <SelectValue placeholder="Choose department" />
                            </SelectTrigger>
                            <SelectContent className="wv:z-[2147483647]">
                                {microphones.map((device, index) => (
                                    <SelectItem value={device.deviceId} key={`microphone_${index}`}>
                                        {device.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldDescription>Selecione o microfone que deseja usar na ligação</FieldDescription>
                    </Field>

                    <Field className="wv:flex wv:flex-col wv:gap-1 wv:text-foreground">
                        <FieldLabel>Alto falante</FieldLabel>
                        <Select>
                            <SelectTrigger className="wv:max-w-[300px]">
                                <SelectValue placeholder="Choose department" />
                            </SelectTrigger>
                            <SelectContent className="wv:z-[2147483647]">
                                {speakers.map((device, index) => (
                                    <SelectItem value={device.deviceId} key={`speaker_${index}`}>
                                        {device.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldDescription>Selecione o alto falante que deseja usar na ligação</FieldDescription>
                    </Field>
                </FieldGroup>
            </FieldSet>
        </div>
    );
}
