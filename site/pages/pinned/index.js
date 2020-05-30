import Link from 'next/link';

import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import { jsx } from '@emotion/core';
import { format, parseISO } from 'date-fns';

import Layout from '../../templates/layout';
import { withApollo } from '../../lib/apollo';


/** @jsx jsx */

const Post = ({ post }) => {
  return (
      <div
        css={{
          display: 'block',
          background: 'white',
          boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)',
          marginBottom: 32,
          cursor: 'pointer',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <article css={{ padding: '1em' }}>
          <h3 css={{ marginTop: 0, color: '#29363D',}}>{post.title}</h3>
          <p>{post.description}</p>
        </article>
      </div>
  );
};



export default withApollo(() => {

  const { data:data2, loading:loading2, error:error2} = useQuery(gql`
    query {
      authenticatedUser {
        id
        slug
      }
    }
  `);


  const { data, loading, error } = useQuery(gql`
    query {
      allBookmarks(where:{owner:{slug:"dig2pin"}}){
        title
        description
      }
    }
  `);

  return (
    <Layout>
      <section css={{ margin: '48px 0' }}>
        <h2>Bookmarks</h2>
        {loading ? (
          <p>loading...</p>
        ) : error ? (
          <p>Error!</p>
        ) : (
          <div>
            {data.allBookmarks.length ? (
              data.allBookmarks.map(post => <Post post={post} key={post.id} />)
            ) : (
              <p>No posts to display</p>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
});
