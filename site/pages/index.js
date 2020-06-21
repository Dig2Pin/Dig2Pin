import Link from 'next/link';

import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import { jsx } from '@emotion/core';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';

import Layout from '../templates/layout';
import Header from '../components/header';
//import { withApollo } from '../lib/apollo';




const GET_AUTH =
  gql`query {
      authenticatedUser {
        id
        slug
      }
    }
    `;

const GET_URL =
  gql`
      query GetUrl($count:Int!){
        allUrls(first:$count,sortBy: posted_DESC){
          id
          slug
          title
          url
          description
          posted
          author{userName}
        }
      }
  `

/** @jsx jsx */

const Pined = () => {
  const { data, loading, error } = useQuery(gql`
    query {
      allPins(first: 3, sortBy: created_DESC){
        title
        body
        url{
          slug
        }
        bookmark{
          owner{
            userName
          }
        }
      }
    }
  `);

  if (loading){
    return(<h1>Loding Pin</h1>)
  }
  if(error){
    return(<h1>Err</h1>)
  }

 return(
  <>
  <style dangerouslySetInnerHTML={{__html: "@media (max-width: 600px) { .recom { width:98%;padding-bottom:180px}}\n@media (min-width: 600px) and (max-width: 900px) { .recom { width:47%;padding-bottom:180px}} " }} />
    {data.allPins.length
      ? (<div>
        <h2>Latest Pinned</h2>
        {data.allPins.map(p => (
          <div
            className ='recom'
            css={{
              width: '31%',
              height:0,
              paddingBottom:'155px',
              float:'left',
              background:'white',
              borderRadius: 6,
              marginBottom:'2%',
              marginRight:'1%',
              marginLeft:'1%',
              boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)',
              overflow: 'hidden',
            }}
          >
          <Link href={`/post/${p.url.slug}`}>
            <a style={{textDecoration: 'none'}}>
              <div style={{margin:'1em'}}>
                <p style={{color: 'hsl(200, 20%, 50%)',borderBottom: '1px solid hsl(200, 20%, 80%)'}} >Pinned By: {p.bookmark.owner.userName}</p>
                <h5 style={{color: '#29363D',marginTop:'-10px'}}>{p.title.substring(0,39)} ...</h5>
                <section style={{color: 'hsl(200, 20%, 50%)'}} dangerouslySetInnerHTML={{ __html: p.body }} />
              </div>
            </a>
          </Link>
          </div>
        ))}
       </div>): (null)
    }
            <div style={{clear:'both'}}></div>
  </>
  )
}

const Post = ({ post }) => {
  return (
    <Link href={`/post/[slug]?slug=${post.slug}`} as={`/post/${post.slug}`} passHref>
      <a
        css={{
          display: 'block',
          background: 'white',
          boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)',
          marginBottom: 32,
          cursor: 'pointer',
          borderRadius: 6,
          overflow: 'hidden',
          textDecoration: 'none',
        }}
      >
        <article css={{ padding: '1em', overflow: 'hidden'}}>
          <h5 css={{ marginTop: 0, color: '#29363D',}}>{post.title}</h5>
          <p css={{ marginBottom: 0, color: 'hsl(200, 20%, 50%)' }}>
            {post.url.split('/').slice(2).join('/')}
          </p>
          <div css={{ marginTop: '1em', borderTop: '1px solid hsl(200, 20%, 80%)' }}>
            <p css={{ marginBottom: 0, color: 'hsl(200, 20%, 50%)' }}>
              Shared by {post.author ? post.author.userName : 'someone'} on{' '}
              {format(parseISO(post.posted), 'dd/MM/yyyy')}
            </p>
          </div>
        </article>
      </a>
    </Link>
  );
};

export default () => {

  const [count, setCount] = useState(20);

  const { data, loading, error } = useQuery(GET_URL,{ variables: {count}});

    const {
    data: { authenticatedUser = [] } = {},
    loading: authLoading,
    error: authError,
  } = useQuery(GET_AUTH);

  return (
    <Layout>
      <Header />
      <nav style={{backgroundColor: 'lightyellow', padding: '0.5rem', marginTop: '2rem', boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)', borderRadius: '6px'}}>
        <ul className="nav" >
          <li className="nav-item">
            <Link href={`/`}>
              <a style={{color: 'lightyellow', backgroundColor: 'black', borderRadius: '6px', padding:'5px',margin:'5px'}}>
              Home
              </a>
            </Link>
          </li>
          <li className="nav-item">
          {
            authenticatedUser? (
                  <Link href={`/bookmark/${authenticatedUser.slug}`}>
                    <a style={{color: 'black', borderRadius: '6px', padding:'5px',margin:'5px'}}>
                    Bookmarks
                    </a>
                  </Link>
              ):(
                  <Link href={`/bookmark`}>
                    <a style={{color: 'black', borderRadius: '6px', padding:'5px',margin:'5px'}}>
                    Bookmarks
                    </a>
                  </Link>
              )
            }
          </li>
        </ul>
      </nav>
      <section css={{ margin: '48px 0' }}>
        <h2>About</h2>
        <p>Dig2Pin is a social bookmarking platform to discover, pin, 
        and comment interesting instant links in your friend circle. Check our github page to join us.
        </p>
      </section>
      <section css={{ marginBottom: '-24px' }}>
      <Pined/>
      </section>
      <section css={{ margin: '48px 0' }}>
        <h2>Latest Posts</h2>
        {loading ? (
          <p>loading...</p>
        ) : error ? (
          <p>Error!</p>
        ) : (
          <div>
            {data.allUrls.length ? (
              data.allUrls.map(post => <Post post={post}/>)
            ) : (
              <p>No posts to display</p>
            )}
          </div>
        )}
      </section>
      <section>
        <center>
          <button
            css={{
              padding: '6px 12px',
              borderRadius: 6,
              background: 'black',
              fontSize: '1.5em',
              color: 'white',
              border: 0,
            }}
            onClick={() => setCount(count + 20)}
          >
            Load More
          </button>
        </center>
      </section>
    </Layout>
  );
};
