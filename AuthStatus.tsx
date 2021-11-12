import { ReactNode, createContext, useContext, useState } from "react";

const AuthStatusContext = createContext();

export enum AuthStatus {
  Pending = "pending",
  Authenticated = "authenticated",
  Unauthenticated = "unauthenticated",
}

export function AuthProvider({ children }: { children?: ReactNode }) {
  const state = useState<AuthStatus>(AuthStatus.Pending);
  return (
    <AuthStatusContext.Provider value={state}>
      {children}
    </AuthStatusContext.Provider>
  );
}

export function useAuthStatus() {
  return useContext(AuthStatusContext);
}
