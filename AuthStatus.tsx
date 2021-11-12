// @ts-nocheck
import {
  ReactNode,
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

export enum AuthStatus {
  Pending = "pending",
  Authenticated = "authenticated",
  Unauthenticated = "unauthenticated",
}

const AuthStatusContext = createContext([]);

export function AuthProvider({ children }: { children?: ReactNode }) {
  const state = useState<AuthStatus>(AuthStatus.Pending);
  return (
    <AuthStatusContext.Provider value={state}>
      {children}
    </AuthStatusContext.Provider>
  );
}

export function useAuthStatus(): [
  AuthStatus,
  Dispatch<SetStateAction<AuthStatus>>
] {
  return useContext(AuthStatusContext) as AuthStatus;
}
