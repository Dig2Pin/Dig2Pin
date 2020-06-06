import Link from 'next/link';
import { jsx } from '@emotion/core';

/** @jsx jsx */

export default () => (
  <header
    css={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '48px 0',
    }}
  >
    <Link href="/" passHref>
    <img src="/logo.png" alt="Dig2Pin.Cpm" style={{height:'3em'}} />
    </Link>
    <Link href="/post/new" passHref>
      <a css={{ color: 'hsl(200, 20%, 50%)', cursor: 'pointer' }}>+ Share an URL</a>
    </Link>
  </header>
);
