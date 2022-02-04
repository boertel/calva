import "@boertel/cmdk/dist/cmdk.cjs.development.css";

import "../styles/globals.css";

import { ClockProvider } from "@/hooks";
import { CommandProvider } from "components/Command";
import { SettingsProvider } from "components/Settings";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ReactNode } from "react";
import { SWRConfig } from "swr";

import { AuthProvider, AuthStatus, useAuthStatus } from "../AuthStatus";

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
                <CommandProvider>
                  <Component {...pageProps} />
                </CommandProvider>
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
        revalidateOnFocus: true,
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
