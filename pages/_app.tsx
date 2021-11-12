import { useRouter } from "next/router";
import { ReactNode, createContext, useContext, useState } from "react";
import { SWRConfig } from "swr";
import Head from "next/head";
import type { AppProps } from "next/app";
import { AuthProvider, useAuthStatus, AuthStatus } from "../AuthStatus";

import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>calva</title>
      </Head>
      <AuthProvider>
        <SWRWithAuth>
          <Component {...pageProps} />
        </SWRWithAuth>
      </AuthProvider>
    </>
  );
}

function SWRWithAuth({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useAuthStatus();
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
