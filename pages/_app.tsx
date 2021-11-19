import { ReactNode } from "react";
import { SWRConfig } from "swr";
import Head from "next/head";
import type { AppProps } from "next/app";
import { AuthProvider, useAuthStatus, AuthStatus } from "../AuthStatus";
import { SettingsProvider } from "components/Settings";
import { ClockProvider } from "@/hooks";
import { SessionProvider } from "next-auth/react";

import "../styles/globals.css";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <title>calva</title>
      </Head>
      <SessionProvider session={session}>
        <AuthProvider>
          <SWRWithAuth>
            <SettingsProvider>
              <ClockProvider>
                <Component {...pageProps} />
              </ClockProvider>
            </SettingsProvider>
          </SWRWithAuth>
        </AuthProvider>
      </SessionProvider>
    </>
  );
}

function SWRWithAuth({ children }: { children: ReactNode }) {
  const [, setAuthStatus] = useAuthStatus();
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => {
            if (res.ok) {
              setAuthStatus(AuthStatus.Authenticated);
              return res.json();
            } else if (res.status === 401) {
              setAuthStatus(AuthStatus.Unauthenticated);
            }
          }),
      }}
    >
      {children}
    </SWRConfig>
  );
}
