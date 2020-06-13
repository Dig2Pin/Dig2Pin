import gql from 'graphql-tag';
import { useQuery,useLazyQuery,useMutation } from '@apollo/react-hooks';
import { jsx } from '@emotion/core';
import Layout from '../../templates/layout';
import Header from '../../components/header';
import { useAuth } from '../../lib/authentication';
import Link from 'next/link';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';


const GET_BOOKMARKS = gql`
  query GetBookmarks($user:String!) {
      allBookmarks(sortBy: created_DESC , where:{owner:{slug:$user}}){
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
  gql`query GetUser($userslug: String){
        allUsers(where:{slug:$userslug}){
          id
          slug
          userName
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
    <div style={{
          marginTop:'48px',
          padding:'10px',
          display: 'block',
          background: 'white!important',
          marginBottom: -1,
          border: '1px solid hsla(200, 20%, 20%, 0.20)',
          textDecoration: 'none',
      }}>
      <h4>Add new bookmark</h4>
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
        <div className="form-group">
          <input
            className='form-control'
            style={{marginRight:'10px',marginBottom:'10px'}}
            type="text"
            placeholder="Write a title"
            name="title"
            required
            value={title}
            onChange={event => {
              setTitle(event.target.value);
            }}
          />
          <input
            className='form-control'
            type="text"
            placeholder="Write a description"
            name="description"
            required
            value={description}
            onChange={event => {
              setDescription(event.target.value);
            }}
          />
        </div>
        <div className="form-action">
          <button className="btn"
            style={{background:'hsl(200, 20%, 50%)',color:'white'}}
            type="submit"
          > 
          Add

          </button>
        </div>
      </form>
    </div>)
};


const Bookmark = ({data, loading, error}) => {

  const {
    data: { authenticatedUser = [] } = {},
    loading: authLoading,
    error: authError,
  } = useQuery(GET_AUTH);


  const [getResponses,{data:{ allBookmarks = [] } = {}, called, loading: queryLoading, error:queryError }] = useLazyQuery(GET_BOOKMARKS,{refetchQueries: ['GetUser']});

  
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
    <Header/>
      <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" />
      <nav style={{backgroundColor: 'lightyellow', padding: '0.5rem', marginTop: '2rem', boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)', borderRadius: '6px'}}>
        <ul className="nav" >
            <li className="nav-item">
              <Link href={`/`}>
                <a style={{color: 'black', borderRadius: '6px', padding:'5px',margin:'5px'}}>
                Home
                </a>
              </Link>
            </li>
            {
              authenticatedUser? (
                  <li className="nav-item">
                    <Link href={`/bookmark/${authenticatedUser.slug}`}>
                      <a style={{color: 'lightyellow', backgroundColor: 'black', borderRadius: '6px', padding:'5px',margin:'5px'}}>
                      Bookmarks
                      </a>
                    </Link>
                  </li>
                ):(null)
            }
        </ul>
      </nav>
      { authenticatedUser? (
          (authenticatedUser.slug == data.slug)? (
            <><CreateBookmark/></>
          ):(<h4 style={{marginTop:'48px'}}>{data.userName}'s bookmarks, check <Link href={`/bookmark/${authenticatedUser.slug}`}><a style={{textDecoration: 'none',color:'black'}}>[my bookmarks]</a></Link>.</h4>)
        ):(<><h4 style={{marginTop:'48px'}}>Not Login Yet!</h4>
            <h4>{data.slug}'s bookmarks</h4></>
        )
      }
      <section>
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




const PostPage = ({userslug}) =>  {

  const {
    data: { allUsers = [] } = {},
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER, { variables:{userslug} });

  return (
      <Bookmark loading={userLoading} error={userError} data={allUsers[0]} />
  );

};

PostPage.getInitialProps = ({ query: { userslug } }) => ({ userslug});

export default PostPage;