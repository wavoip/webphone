import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const STORAGE_KEY = "wavoip:selected-device";

interface SelectedDeviceContextType {
  selectedToken: string | null;
  setSelectedToken: (token: string | null) => void;
}

const SelectedDeviceContext = createContext<SelectedDeviceContextType>({
  selectedToken: null,
  setSelectedToken: () => {},
});

export function SelectedDeviceProvider({ children }: { children: ReactNode }) {
  const [selectedToken, _setSelectedToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? null;
  });

  const setSelectedToken = useCallback((token: string | null) => {
    _setSelectedToken(token);
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SelectedDeviceContext.Provider value={{ selectedToken, setSelectedToken }}>
      {children}
    </SelectedDeviceContext.Provider>
  );
}

export function useSelectedDevice() {
  return useContext(SelectedDeviceContext);
}
