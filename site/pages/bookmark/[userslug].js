import gql from 'graphql-tag';
import { useQuery,useLazyQuery,useMutation } from '@apollo/react-hooks';
import { jsx } from '@emotion/core';
import Layout from '../../templates/layout';
import { withApollo } from '../../lib/apollo';
import { useAuth } from '../../lib/authentication';
import Link from 'next/link';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';

const GET_BOOKMARKS = gql`
  query GetBookmarks($user:String!) {
      allBookmarks(sortBy: created_DESC,where:{owner:{slug:$user}}){
        id
        title
        description
      }
  }
`;

const ADD_BOOKMARK = gql`
  mutation AddBookmark( $title:String! , $description: String!, $created: DateTime!) {
    createBookmark(
      data: {title:$title , description: $description, created: $created }
    ) {
      id
      title
      description
      owner {
        slug
      }
      created
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

const GET_AUTH =
  gql`query {
      authenticatedUser {
        id
        slug
      }
    }
    `;

const Post = ({ post }) => {
  return (
    <Link href={`/bookmark/pinned/${post.id}`}>
      <a style={{
          display: 'block',
          background: 'white',
          marginBottom: -1,
          border: '1px solid hsla(200, 20%, 20%, 0.20)',
          textDecoration: 'none',
      }}>
        <article style={{ padding: '1em' }}>
          <h3 style={{color: '#29363D',}}>{post.title}</h3>
          <p style={{ color: '#29363D'}}>{post.description}</p>
        </article>
      </a>
    </Link>
  );
};



const CreateBookmark = () => {

  let [title, setTitle] = useState('');
  let [description, setDescription] = useState('');

  const [createBookmark, { loading: savingBookmark, error: saveError }] = useMutation(ADD_BOOKMARK, {
    refetchQueries: ['GetBookmarks'],
  });

  return (
    <>
      <h5>Add new bookmark</h5>
      <form
        onSubmit={e => {
          e.preventDefault();
          createBookmark({
            variables: {
              title,
              description,
              created: new Date(),
            },
          });
          setTitle('');
          setDescription('');
        }}
      >
        <input
          type="text"
          placeholder="Write a title"
          name="title"
          value={title}
          onChange={event => {
            setTitle(event.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Write a description"
          name="description"
          value={description}
          onChange={event => {
            setDescription(event.target.value);
          }}
        />
        <input
          type="submit"
          value="Submit"
        />
      </form>
    </>)
};


const Bookmark = ({data, loading, error}) => {

  const {
    data: { authenticatedUser = [] } = {},
    loading: authLoading,
    error: authError,
  } = useQuery(GET_AUTH);


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


  return (
    <Layout>
    <CreateBookmark/>
      <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" />
      <nav style={{backgroundColor: 'orange', padding: '0.5rem', marginTop: '2rem', boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)', borderRadius: '6px'}}>
        <ul className="nav" >
            <li className="nav-item">
              <Link href={`/`}>
                <a style={{color: '#eee', borderRadius: '6px', padding:'5px',margin:'5px'}}>
                Home
                </a>
              </Link>
            </li>
            {
              authenticatedUser? (
                  <li className="nav-item">
                    <Link href={`/bookmark/${authenticatedUser.slug}`}>
                      <a style={{color: 'orange', backgroundColor: '#eee', borderRadius: '6px', padding:'5px',margin:'5px'}}>
                      Bookmarks
                      </a>
                    </Link>
                  </li>
                ):(null)
            }
        </ul>
      </nav>
      <section style={{ margin: '48px 0' }}>
        <h2>Bookmarks</h2>
        <h2>User: {data.slug}</h2>
        { authenticatedUser? (
              (authenticatedUser.slug == data.slug)?(
                <h2>AUTH = DATA</h2>
                ):(
                <h2>AUTH != DATA</h2>
                )
          ):(
            <h2>Not Login Yet!</h2>
          )
        }
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
          <div style={{
                boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)',
          }}>
            {allBookmarks.length ? (
              allBookmarks.map(post => <Post post={post} key={post.id}/>)
            ) : (
              <p>No posts to display</p>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
}




const PostPage = withApollo(({userslug}) =>  {

  const {
    data: { allUsers = [] } = {},
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER, { variables:{userslug} });

  return (
      <Bookmark loading={userLoading} error={userError} data={allUsers[0]} />
  );

});

PostPage.getInitialProps = ({ query: { userslug } }) => ({ userslug});

export default PostPage;