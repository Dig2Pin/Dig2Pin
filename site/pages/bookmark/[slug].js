import gql from 'graphql-tag';
import { useQuery,useLazyQuery } from '@apollo/react-hooks';

import { jsx } from '@emotion/core';

import Layout from '../../templates/layout';
import { withApollo } from '../../lib/apollo';

import { useAuth } from '../../lib/authentication';



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



const Bookmark = ({data, loading, error}) => {



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



  if (!called) {
      getResponses({ variables: { user: data.slug } })};

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




const PostPage = withApollo(({slug}) =>  {

  const {
    data: { allUsers = [] } = {},
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER, { variables:{slug} });

  return (    
      <Bookmark loading={userLoading} error={userError} data={allUsers[0]} />
  );

});

PostPage.getInitialProps = ({ query: { slug } }) => ({ slug });

export default PostPage;