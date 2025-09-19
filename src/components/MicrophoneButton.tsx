import { MicrophoneIcon, MicrophoneSlashIcon, WarningIcon } from "@phosphor-icons/react";
import type { CallActive, CallOutgoing, MultimediaError } from "@wavoip/wavoip-api";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { handleMultimediaError } from "@/providers/WavoipProvider";

type Props = {
  call: CallActive | CallOutgoing;
  multimediaError?: MultimediaError;
  muted: boolean;
  setStatus: React.Dispatch<React.SetStateAction<string | null>>;
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;
  requestMicPerm: () => void;
};

export function MicrophoneButton({ call, muted, multimediaError, setStatus, setMuted, requestMicPerm }: Props) {
  if (multimediaError) {
    return (
      <Tooltip>
        <Button
          type="button"
          onClick={() => {
            requestMicPerm();
          }}
          className="wv:relative wv:size-fit wv:aspect-square wv:rounded-full wv:bg-muted-foreground wv:hover:bg-muted-foreground wv:hover:cursor-pointer"
          asChild
        >
          <TooltipTrigger>
            <MicrophoneSlashIcon className="wv:size-6" />
            <div className="wv:absolute wv:top-0 wv:right-0 wv:-translate-y-2 wv:translate-x-1 wv:flex wv:justify-center wv:items-center wv:p-1 wv:rounded-full wv:bg-red-600">
              <WarningIcon className="wv:size-4" />
            </div>
          </TooltipTrigger>
        </Button>
        <TooltipContent>
          <p>{handleMultimediaError(multimediaError)}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (muted) {
    return (
      <Button
        type="button"
        onClick={() => {
          call.unmute().then(({ err }) => {
            if (err) {
              setStatus(err);
            } else {
              setMuted(false);
            }
          });
        }}
        className="wv:size-fit wv:aspect-square wv:rounded-full wv:bg-red-500 wv:hover:bg-red-400 wv:hover:cursor-pointer"
      >
        <MicrophoneSlashIcon className="wv:size-6" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={() => {
        call.mute().then(({ err }) => {
          if (err) {
            setStatus(err);
          } else {
            setMuted(true);
          }
        });
      }}
      className="wv:size-fit wv:aspect-square wv:rounded-full wv:bg-green-500 wv:hover:bg-green-400 wv:hover:cursor-pointer"
    >
      <MicrophoneIcon className="wv:size-6" />
    </Button>
  );
}
