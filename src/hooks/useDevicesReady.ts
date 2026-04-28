import { useEffect, useState } from "react";

let _ready = false;
const _listeners = new Set<(ready: boolean) => void>();

setTimeout(() => {
  _ready = true;
  _listeners.forEach((fn) => fn(true));
}, 5000);

export function useDevicesReady() {
  const [ready, setReady] = useState(_ready);

  useEffect(() => {
    if (_ready) return;
    _listeners.add(setReady);
    return () => { _listeners.delete(setReady); };
  }, []);

  return ready;
}
