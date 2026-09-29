import { User } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFullnameLetters } from "@/lib/utils";

type Props = {
  src?: string | null;
  displayName?: string | null;
  className?: string;
};

export function ContactAvatar({ src, displayName, className }: Props) {
  const initials = getFullnameLetters(displayName);

  return (
    <Avatar className={className}>
      <AvatarImage src={src || undefined} />
      <AvatarFallback>{initials !== null ? initials : <User size={20} />}</AvatarFallback>
    </Avatar>
  );
}
