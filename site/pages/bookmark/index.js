import gql from 'graphql-tag';
import { useQuery,useLazyQuery } from '@apollo/react-hooks';
import { jsx } from '@emotion/core';
import Layout from '../../templates/layout';
import { useAuth } from '../../lib/authentication';
import Link from 'next/link';



const GET_ALL_BOOKMARKS = gql`
  query {
    allBookmarks{
        id
        title
        description
        owner{
          slug
          userName
        }
      }
  }
`;



const Post = ({ post }) => {
  return (
      <div
        style={{
          display: 'block',
          background: 'white',
          marginBottom: -1,
          border: '1px solid hsla(200, 20%, 20%, 0.20)'
        }}
      >
        <article style={{ padding: '1em' }}>
        <Link href={`/pinned/${post.id}`}>
          <a style={{color: '#29363D',textDecoration: 'none',}}>
            <h3 style={{color: '#29363D',}}>{post.title}</h3>
            <p style={{color: '#29363D',}}>{post.description}</p>
          </a>
        </Link>
          <div style={{ marginTop: '1em', borderTop: '1px solid hsl(200, 20%, 80%)' }}>
            <p style={{ marginBottom: 0, color: 'hsl(200, 20%, 50%)' }}>
              Bookmarked by <Link href={`/bookmark/${post.owner.slug}`}>
                  <a style={{color: '#FFCC99',textDecoration:'none'}}>
                  {post.owner ? post.owner.userName : 'someone'}
                  </a>
              </Link>  
            </p>
          </div>
        </article>
      </div>
  );
};




const Bookmark = () => {

  const {data:{ allBookmarks = [] } = {}, loading: queryLoading, error:queryError }= useQuery(GET_ALL_BOOKMARKS);

  
  // event is null while the outer query is fetching it
  if ( queryLoading) {
    return (<p>Loading</p>);
  }

  // Error fetching the event, show nothing
  if (queryError) {
    console.error('Failed to render the user', queryError);
    return null;
  }

  return (
    <Layout>
    <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" />
      <section style={{ margin: '48px 0' }}>
        <h2>All Bookmarks</h2>
        {queryLoading ? (
          <p>BookmarkLoading...</p>
        ):
        queryError ? (
          <p>BookmarkError!</p>
        ) :
        (
          <div style={{
                boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)',
              }}>
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




export default () =>  {

  return (    
      <Bookmark/>
  );

};