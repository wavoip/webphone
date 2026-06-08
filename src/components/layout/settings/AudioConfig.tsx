import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AudioLevelMeter } from "@/components/audio-level/AudioLevelMeter";
import { useMicAnalyser } from "@/components/audio-level/useMicAnalyser";
import { useSpeakerTester } from "@/components/audio-level/useSpeakerTester";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n";
import { useAudioState, useMiddleware } from "@/middleware/react/hooks";

export function AudioConfig() {
  const middleware = useMiddleware();
  const { micPermission, availableAudio, selectedMicId, selectedSpeakerId } = useAudioState();

  const isSecure = typeof window === "undefined" ? true : window.isSecureContext;
  const granted = micPermission === "granted";
  const mics = availableAudio.mics.filter((d) => d.deviceId);
  const speakers = availableAudio.speakers.filter((d) => d.deviceId);

  const [monitoring, setMonitoring] = useState(false);
  const { analyser: micAnalyser } = useMicAnalyser({
    deviceId: selectedMicId,
    enabled: granted,
    playback: monitoring,
    speakerId: selectedSpeakerId,
  });
  const speakerTester = useSpeakerTester({ deviceId: selectedSpeakerId, enabled: granted });

  // Force a refresh on tab open so Chromium's persisted-permission/blank-ids
  // edge case resolves before render settles. SDK fires `devicesChanged`; the
  // controller subscription writes the populated list into the store.
  useEffect(() => {
    void middleware.controllers.audio.refresh();
  }, [middleware]);

  const onMicChange = async (deviceId: string) => {
    const { err } = await middleware.controllers.audio.setMicrophone(deviceId);
    if (err) toast.error(t("Failed to switch microphone"), { description: err });
  };

  const onSpeakerChange = (deviceId: string) => {
    middleware.controllers.audio.setSpeaker(deviceId);
  };

  const onRequestPermission = async () => {
    const state = await middleware.controllers.audio.requestPermission();
    if (state === "denied") toast.error(t("Microphone permission denied"));
  };

  return (
    <div className=" wv:py-3 wv:flex wv:flex-col wv:gap-3">
      {!isSecure && (
        <div
          role="alert"
          className="wv:flex wv:flex-col wv:gap-1 wv:rounded-md wv:border wv:border-yellow-500/40 wv:bg-yellow-500/10 wv:p-3 wv:text-foreground"
        >
          <p className="wv:text-[14px] wv:font-medium">{t("Insecure context")}</p>
          <p className="wv:text-[12px] wv:opacity-80">
            {t("Webphone requires HTTPS or localhost to list audio devices. Audio names are hidden by the browser.")}
          </p>
        </div>
      )}

      {!granted && micPermission !== "denied" && (
        <div
          role="alert"
          className="wv:flex wv:flex-col wv:gap-2 wv:rounded-md wv:border wv:border-yellow-500/40 wv:bg-yellow-500/10 wv:p-3 wv:text-foreground"
        >
          <p className="wv:text-[14px] wv:font-medium">{t("Microphone permission required")}</p>
          <p className="wv:text-[12px] wv:opacity-80">{t("Grant permission to list your audio devices")}</p>
          <Button type="button" onClick={onRequestPermission} className="wv:self-start">
            {t("Grant permission")}
          </Button>
        </div>
      )}

      {micPermission === "denied" && (
        <div
          role="alert"
          className="wv:flex wv:flex-col wv:gap-1 wv:rounded-md wv:border wv:border-red-500/40 wv:bg-red-500/10 wv:p-3 wv:text-foreground"
        >
          <p className="wv:text-[12px]">{t("Microphone permission denied. Enable it in your browser settings.")}</p>
        </div>
      )}

      <FieldSet>
        <FieldGroup className="wv:flex wv:flex-col wv:gap-4">
          <Field className="wv:flex wv:flex-col wv:gap-1 wv:text-foreground">
            <FieldLabel className="wv:flex wv:items-center wv:gap-2">
              <span>{t("Microphone")}</span>
              <AudioLevelMeter analyser={micAnalyser} />
              {granted && (
                <button
                  type="button"
                  onClick={() => setMonitoring((v) => !v)}
                  className="wv:text-[11px] wv:text-foreground/70 wv:hover:text-foreground wv:underline wv:hover:cursor-pointer wv:ml-1"
                >
                  {monitoring ? t("Stop") : t("Listen")}
                </button>
              )}
            </FieldLabel>
            <Select value={selectedMicId ?? undefined} onValueChange={onMicChange} disabled={!granted}>
              <SelectTrigger className="wv:max-w-[300px]">
                <SelectValue placeholder={t("Select the microphone to use on calls")} />
              </SelectTrigger>
              <SelectContent>
                {mics.map((device) => (
                  <SelectItem value={device.deviceId} key={`microphone_${device.deviceId}`}>
                    {device.label || device.deviceId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>{t("Select the microphone to use on calls")}</FieldDescription>
            {monitoring && (
              <p className="wv:text-[11px] wv:text-yellow-600 wv:opacity-90">{t("Use headphones to avoid feedback")}</p>
            )}
          </Field>

          <Field className="wv:flex wv:flex-col wv:gap-1 wv:text-foreground">
            <FieldLabel className="wv:flex wv:items-center wv:gap-2">
              <span>{t("Speaker")}</span>
              <AudioLevelMeter analyser={speakerTester.analyser} />
              {granted && (
                <button
                  type="button"
                  onClick={speakerTester.play}
                  className="wv:text-[11px] wv:text-foreground/70 wv:hover:text-foreground wv:underline wv:hover:cursor-pointer wv:ml-1"
                >
                  {t("Test")}
                </button>
              )}
            </FieldLabel>
            <Select value={selectedSpeakerId ?? undefined} onValueChange={onSpeakerChange} disabled={!granted}>
              <SelectTrigger className="wv:max-w-[300px]">
                <SelectValue placeholder={t("Select the speaker to use on calls")} />
              </SelectTrigger>
              <SelectContent>
                {speakers.map((device) => (
                  <SelectItem value={device.deviceId} key={`speaker_${device.deviceId}`}>
                    {device.label || device.deviceId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>{t("Select the speaker to use on calls")}</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>

      <p className="wv:text-[11px] wv:text-foreground/60 wv:mt-2">
        {t("Permission status")}: {t(micPermission)} · {t("Secure context")}: {t(isSecure ? "yes" : "no")}
      </p>
    </div>
  );
}
