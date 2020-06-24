import Link from 'next/link';
import { jsx } from '@emotion/core';
import { useAuth } from '../lib/authentication';
import AuthModal from '../components/auth/modal';
import Router from 'next/router';

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
                <button style={{
                  margin:'0.2em',
                  borderRadius:'0.25em',
                  background: 'hsl(200, 20%, 50%)',
                  color:'white',
                  float:'right'}}
                  onClick={event => {Router.push('/post/new')
                  }}>
                  ＋ Post
                </button>
        ):(
            <div>
            <AuthModal mode="signin">
              {({ openModal }) => (
                <>
                  <button style={{
                    margin:'0.2em',
                    borderRadius:'0.25em',
                    background: 'hsl(200, 20%, 50%)',
                    color:'white',
                    float:'right'
                  }} 
                  href="/signin"
                  onClick={openModal}>
                    ＋ Post
                  </button>
                </>
              )}
            </AuthModal>
            <AuthModal mode="signin">
              {({ openModal }) => (
                <>
                  <button style={{
                    margin:'0.2em',
                    borderRadius:'0.25em',
                    background: 'hsl(200, 20%, 50%)',
                    color:'white',
                    float:'right'
                  }} 
                  href="/signin"
                  onClick={openModal}>
                    ＋ Sign In
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
