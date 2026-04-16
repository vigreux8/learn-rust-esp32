import { createContext } from "preact";
import { useContext } from "preact/hooks";

export type UserSession = { userId: number; pseudot: string };

export const UserSessionContext = createContext<UserSession | null>(null);

export function useUserSession(): UserSession {
  const v = useContext(UserSessionContext);
  if (v == null) {
    throw new Error("useUserSession doit être utilisé sous une session active");
  }
  return v;
}
