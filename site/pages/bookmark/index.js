import Link from 'next/link';

import gql from 'graphql-tag';
import { useQuery,useLazyQuery } from '@apollo/react-hooks';

import { jsx } from '@emotion/core';
import { format, parseISO } from 'date-fns';

import Layout from '../../templates/layout';
import { withApollo } from '../../lib/apollo';



export const GET_USER = gql`query {
      authenticatedUser {
        id
        slug
      }
    }
  `;


const GET_BOOKMARKS = gql`
  query GetBookmarks($user:slug!) {
      allBookmarks(where:{owner:{slug:$user}}){
        title
        description
      }
  }
`;



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




const AuthUser = ({user, isLoading, error}) => {
  const [
    getResponses,
    {data:{ allBookmarks = [] } = {}, called, loading: queryLoading, error:queryError },
  ] = useLazyQuery(GET_BOOKMARKS);

  if ((isLoading && !user) || queryLoading) {
    return (<p>Loading</p>);
  }

  // Error fetching the event, show nothing
  if (error) {
    console.error('Failed to render the user', error);
    return null;
  }

  // Event is loaded but somehow still null. Bail.
  if (!isLoading && !user) {
    return null;
  }




  if (!called) {
    getResponses({ variables: { user:user.slug }});
  };

 const { id, slug} = user;


  return (
    <Layout>
      <section css={{ margin: '48px 0' }}>
        <h2>Bookmarks</h2>
        <p>{user.id}</p>
        <p>{String(slug)}</p>
        <p>number:{allBookmarks.length}</p>
        {queryLoading ? (
          <p>loading...</p>
        ) : queryError ? (
          <p>Errorfrom2!</p>
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
}







export default withApollo(() => {

  const {
    data: { authenticatedUser = [] } = {},
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER);

  return (
    <>
      <AuthUser isLoading={userLoading} error={userError} user={authenticatedUser} />
      <p>{authenticatedUser.id}</p>
    </>
  );

});