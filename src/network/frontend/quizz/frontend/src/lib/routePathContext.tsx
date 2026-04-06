import { createContext } from "preact";
import { useContext } from "preact/hooks";

export const RoutePathContext = createContext<string>("/");

export function useRoutePath() {
  return useContext(RoutePathContext);
}
