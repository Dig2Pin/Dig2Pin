import Link from 'next/link';
import { jsx } from '@emotion/core';
import { useAuth } from '../lib/authentication';
import AuthModal from '../components/auth/modal';

/** @jsx jsx */

export default () => {
  const { isAuthenticated} = useAuth();

  return(
    <>
    <style dangerouslySetInnerHTML={{__html: "@media (max-width: 580px) { .logo { width:45%!important;}}\n@media (min-width: 580px) and (max-width: 900px) { .logo { width:30%!important}} " }} />
    <header
      css={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '48px 0',
      }}
    >
      <Link href="/" passHref>
      <img className='logo' src="/logo.png" alt="Dig2Pin.Com" style={{width:'20%'}} />
      </Link>
      { isAuthenticated ? (
            <Link href="/post/new" passHref>
              <a css={{ color: 'hsl(200, 20%, 50%)', cursor: 'pointer' }}>+ Share an URL</a>
            </Link>
        ):(
            <div>
            <AuthModal mode="signin">
              {({ openModal }) => (
                <>
                  <button style={{
                    margin:'0.2em',
                    borderRadius:'0.25em',
                    background: 'hsl(200, 20%, 50%)',
                    color:'white'
                  }} href="/signin" onClick={openModal}>
                    Sign In
                  </button>
                </>
              )}
            </AuthModal>
            <AuthModal mode="signup">
              {({ openModal }) => (
                <>
                  <button style={{
                    margin:'0.2em',
                    borderRadius:'0.25em',
                    background: 'hsl(200, 20%, 50%)',
                    color:'white'                    
                }} href="/signup" onClick={openModal}>
                    Sign Up
                  </button>
                </>
              )}
            </AuthModal>
            </div>
        )
      }
    </header>
    </>
    )
};
