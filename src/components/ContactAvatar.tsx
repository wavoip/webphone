import { Show } from "solid-js";
import { User } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFullnameLetters } from "@/lib/utils";

type Props = {
  src?: string | null;
  displayName?: string | null;
  class?: string;
};

export function ContactAvatar(props: Props) {
  const initials = () => getFullnameLetters(props.displayName);

  return (
    <Avatar class={props.class}>
      <AvatarImage src={props.src || undefined} />
      <AvatarFallback>
        <Show when={initials()} fallback={<User size={20} />}>
          {initials()}
        </Show>
      </AvatarFallback>
    </Avatar>
  );
}
