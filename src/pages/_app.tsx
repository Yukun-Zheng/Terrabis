import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

/**
 * Next.js应用组件
 */
function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#3388ff" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default App; 