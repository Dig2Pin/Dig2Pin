import Link from 'next/link';

import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import { jsx } from '@emotion/core';
import { format, parseISO } from 'date-fns';

import Layout from '../templates/layout';
import Header from '../components/header';
import { withApollo } from '../lib/apollo';




const GET_AUTH =
  gql`query {
      authenticatedUser {
        id
        slug
      }
    }
    `;



/** @jsx jsx */

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
        <article css={{ padding: '1em' }}>
          <h3 css={{ marginTop: 0, color: '#29363D',}}>{post.title}</h3>
          <p css={{ marginBottom: 0, color: 'hsl(200, 20%, 50%)' }}>
            {post.url.substring(7,46)}...
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

export default withApollo(() => {
  const { data, loading, error } = useQuery(gql`
    query {
      allUrls(sortBy: posted_DESC){
        slug
        title
        url
        description
        posted
        author{userName}
      }
    }
  `);

    const {
    data: { authenticatedUser = [] } = {},
    loading: authLoading,
    error: authError,
  } = useQuery(GET_AUTH);

  return (
    <Layout>
      <Header />
      <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" />
      <nav style={{backgroundColor: 'orange', padding: '0.5rem', marginTop: '2rem', boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)', borderRadius: '6px'}}>
        <ul className="nav" >
            <li className="nav-item">
              <Link href={`/`}>
                <a style={{color: 'orange', backgroundColor: '#eee', borderRadius: '6px', padding:'5px',margin:'5px'}}>
                Home
                </a>
              </Link>
            </li>
            {
              authenticatedUser? (
                  <li className="nav-item">
                    <Link href={`/bookmark/${authenticatedUser.slug}`}>
                      <a style={{color: '#eee', borderRadius: '6px', padding:'5px',margin:'5px'}}>
                      Bookmarks
                      </a>
                    </Link>
                  </li>
                ):(null)
            }
        </ul>
      </nav>
      <section css={{ margin: '48px 0' }}>
        <h2>About</h2>
        <p>Dig2Pin is a social bookmarking platform to discover, pin, 
        and comment interesting instant links in your friend circle. Check our github page to join us.
        </p>
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
              data.allUrls.map(post => <Post post={post} key={post.id} />)
            ) : (
              <p>No posts to display</p>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
});
