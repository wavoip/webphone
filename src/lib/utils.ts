import type { MultimediaError } from "@wavoip/wavoip-api";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleMultimediaError(err: MultimediaError) {
  if (err.type === "audio") {
    if (err.reason === "NotAllowedError") {
      return "Permissão do alto falante foi negada";
    }
  }

  if (err.type === "microphone") {
    if (err.reason === "NotAllowedError") {
      return "Permissão do microfone foi negada";
    }
    if (err.reason === "OverconstrainedError") {
      return "Microfone não suporta os requisitos de áudio";
    }
    if (err.reason === "SecurityError") {
      return "Não é possível acessar o microfone, a página é insegura";
    }
    if (err.reason === "NotReadableError") {
      return "Não foi possível acessar o microfone";
    }
    if (err.reason === "NotFoundError") {
      return "Nenhum microfone encontrado";
    }
    if (err.reason === "AbortError") {
      return "O hardware do microfone não pode ser inicializado";
    }
  }
}
