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

const GET_USER =
  gql`query GetUser($slug: String){
        allUsers(where:{slug:$slug}){
          id
          slug
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



const PostPage =  withApollo(({slug}) => {



  const [getResponses,{data:{ allBookmarks = [] } = {}, called, loading: bookmarkLoading, error:bookmarkError}] = useQuery(GET_BOOKMARKS);

  if (!called) {
      getResponses({ variables: { user:"dig2pin"}})};
 if(bookmarkError){console.log(bookmarkError);}

  return (
    <Layout>
      <section css={{ margin: '48px 0' }}>
        <h2>Bookmarks</h2>

        { bookmarkLoading ? (
          <p>Bookmark Loading ...</p>
        ) : bookmarkError ? (
          <p>Bookmark Error!</p>
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

PostPage.getInitialProps = ({ query: { slug } }) => ({ slug });

export default PostPage;
