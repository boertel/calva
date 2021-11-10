import "../styles/globals.css";
import { SWRConfig } from "swr";
import Head from "next/head";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>calva</title>
      </Head>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          fetcher: (resource, init) =>
            fetch(resource, init).then((res) => {
              if (res.ok) {
                return res.json();
              } else if (res.status === 401) {
                router.push(`/auth/login?next=${router.asPath}`);
              }
            }),
        }}
      >
        <Component {...pageProps} />
      </SWRConfig>
    </>
  );
}
export default MyApp;
