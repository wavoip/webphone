import { createContext, useContext, useState, type ReactNode } from "react";

interface SelectedDeviceContextType {
  selectedToken: string | null;
  setSelectedToken: (token: string | null) => void;
}

const SelectedDeviceContext = createContext<SelectedDeviceContextType>({
  selectedToken: null,
  setSelectedToken: () => {},
});

export function SelectedDeviceProvider({ children }: { children: ReactNode }) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  return (
    <SelectedDeviceContext.Provider value={{ selectedToken, setSelectedToken }}>
      {children}
    </SelectedDeviceContext.Provider>
  );
}

export function useSelectedDevice() {
  return useContext(SelectedDeviceContext);
}
