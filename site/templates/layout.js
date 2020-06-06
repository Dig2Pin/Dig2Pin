import Head from 'next/head';
import { jsx, Global } from '@emotion/core';

/** @jsx jsx */

const Layout = ({ children }) => (
  <>
    <Global
      styles={{
        '*': { boxSizing: 'border-box' },
        body: {
          margin: 0,
          background: 'hsl(200, 20%, 90%)',
          color: 'hsl(200, 20%, 20%)',
          fontFamily: "'Rubik', sans-serif",
        },
        h2: {
          fontSize: '1em',
          textTransform: 'uppercase',
          color: 'hsl(200, 20%, 50%)',
        },
        '[disabled]': {
          cursor: 'not-allowed',
          opacity: 0.6,
        },
      }}
    />
    <Head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <title>Dig2Pin</title>
      <link href="https://fonts.googleapis.com/css?family=Rubik" rel="stylesheet" />
      <link rel="shortcut icon" href="favicon.ico" />
    </Head>
    <div
      css={{
        padding: '0 48px',
        width: '100%',
        maxWidth: 960,
        margin: '0 auto',
      }}
    >
      {children}
      <footer
        css={{
          width: '100%',
          textAlign: 'center',
          margin: '48px 0',
          color: 'hsl(200, 20%, 50%)',
        }}
      >
        Built with us on {' '}
        <a
          href="https://github.com/Dig2Pin/Dig2Pin"
          css={{
            color: 'hsl(200, 20%, 50%)',
            fontWeight: 800,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Github
        </a>
        .
      </footer>
    </div>
  </>
);

export default Layout;
