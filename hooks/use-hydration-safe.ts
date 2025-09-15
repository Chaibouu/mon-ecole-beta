import { useEffect, useState } from "react";

export function useHydrationSafe<T>(serverValue: T, clientValue: T): T {
  const [value, setValue] = useState<T>(serverValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setValue(clientValue);
  }, [clientValue]);

  return isClient ? value : serverValue;
}

export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
