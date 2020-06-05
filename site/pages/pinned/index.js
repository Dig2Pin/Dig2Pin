import Link from 'next/link';

import gql from 'graphql-tag';
import { useQuery,useLazyQuery } from '@apollo/react-hooks';

import { jsx } from '@emotion/core';
import { format, parseISO } from 'date-fns';

import Layout from '../../templates/layout';
import { withApollo } from '../../lib/apollo';



const GET_BOOKMARKS = gql`
  query GetBookmarks($user:String!) {
      allBookmarks(where:{owner:{slug:$user}}){
        title
        description
      }
  }
`;

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

  const { data: { authenticatedUser = [] } = {}, loading:loading1, error:error1} = useQuery(gql`
    query {
      authenticatedUser {
        slug
      }
    }
  `);

  const [getResponses,{data:{ allBookmarks = [] } = {}, called, loading: loading2, error:error2 }] = useLazyQuery(GET_BOOKMARKS);

  if (!called) {
      getResponses({ variables: { user: "dig2pin" } })};


  return (
    <Layout>
      <section css={{ margin: '48px 0' }}>
        <h2>Bookmarks</h2>
        <h2>Hi:{authenticatedUser.slug}</h2>
        {loading1 ? (
          <p>loading 1...</p>
        ) : loading2 ? (
          <p>loading 2...</p>
        ) : error1 ? (
          <p>Error  1!</p>
        ) : error2 ? (
          <p>Error  2!</p>
        ) : (
          <div>
            {allBookmarks.length ? (
              allBookmarks.map(post => <Post post={post} key={post.id} />)
            ) : (
              <p>No posts to display</p>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
});