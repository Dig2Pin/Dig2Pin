import gql from 'graphql-tag';
import { useQuery,useLazyQuery } from '@apollo/react-hooks';

import { jsx } from '@emotion/core';

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
  gql`query {
        authenticatedUser{
          id
          slug
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



const AuthUser = ({data, loading, error}) => {



  const [getResponses,{data:{ allBookmarks = [] } = {}, called, loading: queryLoading, error:queryError }] = useLazyQuery(GET_BOOKMARKS);

  
  // event is null while the outer query is fetching it
  if ((loading && !data) || queryLoading) {
    return (<p>Loading</p>);
  }

  // Error fetching the event, show nothing
  if (error) {
    console.error('Failed to render the user', error);
    return null;
  }

  // Event is loaded but somehow still null. Bail.
  if (!loading && !data) {
    return null;
  }

const userSlug = "dig2pin";

  if (!called) {
      getResponses({ variables: { user: userSlug } })};

  const slug = `${data.slug}`;  


  return (
    <Layout>
      <section css={{ margin: '48px 0' }}>
        <h2>Bookmarks</h2>
        <p>{slug}</p>
        {loading ? (
          <p>loading...</p>
        ) : 
        queryLoading ? (
          <p>BookmarkLoading...</p>
        ):
        error ? (
          <p>Error!</p>
        ) :
        queryError ? (
          <p>BookmarkError!</p>
        ) :
        (
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




export default withApollo(() =>  {

  const {
    data: { authenticatedUser = [] } = {},
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER);

  return (    
      <AuthUser loading={userLoading} error={userError} data={authenticatedUser} />
  );

});