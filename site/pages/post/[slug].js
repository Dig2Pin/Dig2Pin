import Head from 'next/head';
import Link from 'next/link';

import gql from 'graphql-tag';
import { useMutation, useQuery,useLazyQuery } from '@apollo/react-hooks';
import { useState } from 'react';

import { jsx } from '@emotion/core';
import { format, parseISO } from 'date-fns';

import Layout from '../../templates/layout';
import Header from '../../components/header';
import { Banner } from '../../components/banner';
import { useAuth } from '../../lib/authentication';
import AuthModal from '../../components/auth/modal';
import Microlink from '@microlink/react'

/** @jsx jsx */

const ADD_COMMENT = gql`
  mutation AddComment($body: String!, $postId: ID!, $posted: DateTime!) {
    createComment(
      data: { body: $body, url: { connect: { id: $postId } }, posted: $posted }
    ) {
      id
      body
      author {
        userName
      }
      posted
    }
  }
`;

const GET_AUTH_BOOKMARKS = gql`
  query GetAuthBookmark($user: ID!){
    allBookmarks(where:{owner:{id:$user}}){
        id
        title
      }
  }
`;

const GET_BOOKMARKS = gql`
  query GetBookmarks($url: ID!){
    allPins(first: 3,sortBy: created_DESC, where:{url:{id:$url}}){
        id
        bookmark{
          id
          title
          description
        }
      }
  }
`;

const GET_PINED = gql`
  query GetPined($url: ID!,$user: ID!){
    allPins(where:{url:{id:$url} ,bookmark:{owner:{id:$user}}}){
        id
        title
        bookmark{
          id
          title
        }
      }
  }
`;

const ADD_BOOKMARK = gql`
  mutation AddBookmark( $createBookmarkTitle:String!, $createBookmarkDescription:String!) {
    createBookmark(data: {title:$createBookmarkTitle, description:$createBookmarkDescription})
    {
      id
      title
    }
  }
`;


const ADD_PIN = gql`
  mutation AddPin( $title:String!, $description:String!, $bookmark:ID! , $url: ID!) {
    createPin(
      data: {title:$title, body:$description, bookmark:{ connect:{ id: $bookmark}}, url:{ connect:{ id: $url}}}
    ) {
      id
      bookmark{
        id
        title
      }
    }
  }
`;

const ALL_QUERIES = gql`
  query AllQueries($slug: String) {
    allUrls(where: { slug: $slug }) {
      id
      url
      title
      slug
      description
      posted
      author {
        userName
      }
    }

    allComments(where: { url: { slug: $slug } }) {
      id
      body
      author {
        userName
      }
      posted
    }
  }
`;


const Recommends = ({post}) => {

const { data, loading, error } = useQuery(GET_BOOKMARKS, { variables: { url:post.id } });

 if(loading){return(<p>Recommends Loding</p>)};

 return(
  <>
  <style dangerouslySetInnerHTML={{__html: "@media (max-width: 600px) { .recom { width:98%;padding-bottom:164px}}\n@media (min-width: 600px) and (max-width: 900px) { .recom { width:47%;padding-bottom:164px}} " }} />
    {data.allPins.length
      ? (<div>
        <h2>The URL is pin on the bookmarks.</h2>
        {data.allPins.map(p => (
          <div
            key={p.id}
            className ='recom'
            css={{
              width: '31%',
              height:0,
              paddingBottom:'188px',
              float:'left',
              background:'white',
              borderRadius: 6,
              marginBottom:'2%',
              marginRight:'1%',
              marginLeft:'1%',
              boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)',
              overflow: 'hidden',
            }}
          >
          <Link href={`/bookmark/pinned/${p.bookmark.id}`}>
            <a target="_blank" style={{textDecoration: 'none',color: '#29363D',}} >
              <div style={{margin:'1em',overflow: 'hidden'}}>
                <h5>{p.bookmark.title}</h5>
                <p>{p.bookmark.description}</p>
              </div>
            </a>
          </Link>
          </div>
        ))}
       </div>): (null)
    }
            <div style={{clear:'both'}}></div>
  </>
  )

}



const Bookmarks = ({post}) => {

  let [bookmark, setBookmark] = useState('');

  let [resMarkId,setResMarkId] = useState('');

  let [createBookmarkTitle,setCreateBookmarkTitle] = useState('');

  let [resMarkTitle,setResMarkTitle] = useState('');
  
  let [createBookmarkDescription,setCreateBookmarDescription] = useState(''); 

  let [pinBookmarkId,setPinBookmarkId] = useState('');

  let [pinBookmarkTitle,setPinBookmarkTitle] = useState('');


  const [createPin, { loading: pinLoading, error: pinError }] = useMutation(ADD_PIN, {
    update: (cache, { data: { createPin } }) => {
      setPinBookmarkId(createPin.bookmark.id);setPinBookmarkTitle(createPin.bookmark.title);
    },
  });


  const [createBookmark, { loading: createBookmarkLoading, error: createBookmarkError }] = useMutation(ADD_BOOKMARK, {
    update: (cache, { data: { createBookmark } }) => {
      setResMarkId(createBookmark.id);setResMarkTitle(createBookmark.title);
    },
    refetchQueries: ['GetAuthBookmark'],
  });

  const { isAuthenticated, isLoading, user } = useAuth();

  const [pinResponses ,{ data:{ allPins = [] } = {}, called:findPinCalled, loading: findPinLoading, error:findPinError }] = useLazyQuery(GET_PINED);

  const [bookmarkResponses ,{ data:{ allBookmarks = [] } = {},called, loading: bookmarkLoading, error:bookmarkError }] = useLazyQuery(GET_AUTH_BOOKMARKS);


  if (!findPinCalled && isAuthenticated) { pinResponses({ variables: { url: post.id, user: user.id}})};

  if (!called && isAuthenticated) { bookmarkResponses({ variables: { user: user.id} })};

  

  if(isLoading){return(<p>User Loding</p>)};

  if(bookmarkLoading){return(<p>Loding Bookmark</p>)};

  if(findPinLoading){return(<p>Loding Finding Pin</p>)};

  if(pinLoading){return(<p>Loding Pin</p>)};

  if(createBookmarkLoading){return(<p>Loding to create bookmark</p>)};

  if(!isAuthenticated){return(
    <AuthModal mode="signin">
      {({ openModal }) => (
        <>
          <button
            className="btn btn-secondary"
            href="/signin"
            style={{marginBottom:24}}
            onClick={openModal}>
            Pin it
          </button>
        </>
      )}
    </AuthModal>
    )};

  if(pinBookmarkId){return(
    <h2 style={{ marginBottom: 32}}>

          <Link href={`/bookmark/pinned/${pinBookmarkId}`} passHref>
            <a target="_blank" style={{textDecoration: 'none'}}>Pinned in {pinBookmarkTitle}!</a>
          </Link>
    </h2>
    )}

  return(
    <>
      {allPins.length ? (
        <h2 style={{ marginBottom: 32}}>Already pinned in :
          <Link href={`/bookmark/pinned/${allPins[0].bookmark.id}`} passHref>
            <a target="_blank" style={{textDecoration: 'none'}}> [{allPins[0].bookmark.title}]</a>
          </Link>
        </h2>
        ):(
        <div style={{ marginBottom: 32}}>
          <h2>Select bookmark to pin</h2>
          <div className="dropdown">
            {resMarkId ? (
                <button style={{background:'yellow',color:'black',border:0}} className="btn btn-secondary" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Pin it
                </button>
              ):(
                <button className="btn btn-secondary" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Pin it
                </button>
              )}
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton" style={{width:'100%',marginTop:'-2.7em'}} >
              <button id="addBookMark" data-toggle="dropdown" style={{border: 0, backgroundColor: 'transparent', outline: 'none'}} >
              + Create a new bookmark
              </button>
              <div className="dropdown-menu" aria-labelledby="addBookMark" style={{width:'100%'}} >
                <form
                  style={{width:'100%',marginTop:'-10px'}}
                  onSubmit={e => {
                    e.preventDefault();
                    createBookmark({
                      variables: {
                        createBookmarkTitle,
                        createBookmarkDescription
                      },
                    });
                    setCreateBookmarkTitle('');
                    setCreateBookmarDescription('')
                  }}
                >
                  <input
                    className='form-control'
                    type="text"
                    required={true}
                    placeholder="Add New Bookmark"
                    name="createBookmarkTitle"
                    value={createBookmarkTitle}
                    onChange={event => {
                      setCreateBookmarkTitle(event.target.value);
                  }}
                  />
                  <input
                    className='form-control'
                    type="text"
                    required={true}
                    placeholder="New Bookmark description"
                    name="createBookmarkDescription"
                    value={createBookmarkDescription}
                    onChange={event => {
                      setCreateBookmarDescription(event.target.value);
                  }}
                  />
                  <input
                    type="submit"
                    value="Add"
                    css={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      background: 'hsl(200, 20%, 50%)',
                      fontSize: '1em',
                      margin:6,
                      color: 'white',
                      border: 0,
                      float:'right',
                    }}
                  />
                </form>
              </div>
              <div>
                { (allBookmarks.length || resMarkId) && (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        createPin({
                          variables: {
                            url:post.id,
                            title:post.title,
                            description:post.description,
                            bookmark,
                          },
                        });
                        setBookmark('');
                      }}   
                    >
                      <select className="form-control" required={true} name="bookmarks" value={bookmark}
                        onChange={event => {
                              setBookmark(event.target.value);
                      }} >
                        <option value=""> (select one bookmark) </option>
                        {allBookmarks.map(bookmark => (
                            <option
                              value={bookmark.id}
                              key={bookmark.id}
                            >
                              {bookmark.title}
                            </option>
                            )
                          )
                        }
                      </select>
                          {resMarkId ? (
                            <input
                              type="submit"
                              value="Pin"
                              css={{
                                padding: '6px 12px',
                                borderRadius: 6,
                                background: 'yellow',
                                fontSize: '1em',
                                color: 'black',
                                border: 0,
                                margin: 6,
                                float:'right',
                              }}
                            />):(
                            <input
                              type="submit"
                              value="Pin"
                              css={{
                                padding: '6px 12px',
                                borderRadius: 6,
                                background: 'hsl(200, 20%, 50%)',
                                fontSize: '1em',
                                color: 'white',
                                border: 0,
                                margin: 6,
                                float:'right',
                              }}
                            />
                            )
                          }
                    </form>
                  )
                }
              </div>
            </div>
          </div>
        </div>
        )
      }
    </>
    )
}


const Comments = ({ data }) => (
  <div>
    <h2>Comments</h2>
    {data.allComments.length
      ? data.allComments.map(comment => (
          <div
            key={comment.id}
            css={{
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div css={{ marginLeft: 16 }}>
              <p
                css={{
                  color: 'hsl(200,20%,50%)',
                  fontSize: '0.8em',
                  fontWeight: 800,
                  margin: '8px 0',
                }}
              >
                {comment.author.userName} on {format(parseISO(comment.posted), 'dd MMM yyyy')}
              </p>
              <p css={{ margin: '8px 0' }}>{comment.body}</p>
            </div>
          </div>
        ))
      : 'No comments yet'}
  </div>
);

const AddComments = ({ post }) => {
  let [comment, setComment] = useState('');

  const { data, loading: userLoading, error: userError } = useQuery(gql`
    query {
      authenticatedUser {
        id
      }
    }
  `);

  const [createComment, { loading: savingComment, error: saveError }] = useMutation(ADD_COMMENT, {
    refetchQueries: ['AllQueries'],
  });

  const loggedIn = !userLoading && !!data.authenticatedUser;
  const formDisabled = !loggedIn || savingComment;
  const error = userError || saveError;

  return (
    <div>
      <h2>Add new Comment</h2>

      {userLoading ? (
        <p>loading...</p>
      ) : (
        <>
          {error && (
            <Banner style={'error'}>
              <strong>Whoops!</strong> Something has gone wrong
              <br />
              {error.message || userError.toString()}
            </Banner>
          )}
          {!loggedIn && (
            <Banner style={'error'}>
            <AuthModal mode="signin">
              {({ openModal }) => (
                <>
                  <button style={{
                    margin:'0.2em',
                    border: '1px solid transparent',
                    background:'transparent'
                  }} 
                  href="/signin" onClick={openModal}>
                    Sign In
                  </button>
                </>
              )}
            </AuthModal>
              to leave a comment.
            </Banner>
          )}
          <form
            onSubmit={e => {
              e.preventDefault();

              createComment({
                variables: {
                  body: comment,
                  postId: post.id,
                  posted: new Date(),
                },
              });
              setComment('');
            }}
          >
            <textarea
              className="form-control"
              required={true}
              type="text"
              placeholder="Write a comment"
              name="comment"
              disabled={formDisabled}
              css={{
                padding: 12,
                fontSize: 16,
                width: '100%',
                height: 60,
                border: 0,
                borderRadius: 6,
                resize: 'none',
              }}
              value={comment}
              onChange={event => {
                setComment(event.target.value);
              }}
            />
            <input
              type="submit"
              value="Submit"
              disabled={formDisabled}
              css={{
                padding: '6px 12px',
                borderRadius: 6,
                background: 'hsl(200, 20%, 50%)',
                fontSize: '1em',
                color: 'white',
                border: 0,
                marginTop: 6,
              }}
            />
          </form>
        </>
      )}
    </div>
  );
};

const Render = ({ children }) => children();


const CustomComponent = ({ loading, preview }) => {
    return( loading 
    ? (<h1>Loading...</h1>)
    : (
        <div>
            <p>Domain: { preview.domain }</p>
            <p>Title: { preview.title }</p>
            <p>Description: { preview.description }</p>
            <img height="100px" width="100px" src={preview.img} alt={preview.title} />
        </div>
    )
    
    )
}

const PostPage = ({ slug }) => {

  const { data, loading, error } = useQuery(ALL_QUERIES, { variables: { slug } });

  return (
    <Layout>
      <Header />
      <div css={{ margin: '48px 0' }}>
        <Link href="/" passHref>
          <a css={{ color: 'hsl(200,20%,50%)', cursor: 'pointer' }}>{'< Go Back'}</a>
        </Link>
        <Render>
          {() => {
            if (loading) return <p>loading...</p>;
            if (error) return <p>Error!</p>;

            const post = data.allUrls && data.allUrls[0];

            if (!post) return <p>404: Post not found</p>;

            return (
              <>
                <div
                  css={{
                    background: 'white',
                    margin: '24px 0',
                    boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)',
                    marginBottom: 32,
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}
                >
                  <Head>
                    <title>{post.title}</title>
                    <meta name="og:image" content={`https://api.microlink.io?url=${post.url}&image&embed=image.url`} />
                    <meta property="og:description" content={post.description} />
                  </Head>
                  <article css={{ margin: '1em',overflow: 'hidden'}}>
                    <a href={post.url} style={{textDecoration: 'none',color: '#29363D'}} target="_blank">
                      <h5 css={{ marginTop: 0 }}>{post.title}</h5>
                      <p css={{ marginTop: 0}}> 👉 &nbsp; {post.url}</p>
                    </a>
                    <Microlink url={post.url} style={{maxWidth: '100%'}}  render={CustomComponent} />
                    <section style={{marginTop:'1em'}}>Description:</section>
                    <section dangerouslySetInnerHTML={{ __html: post.description }} />
                    <div css={{ marginTop: '1em', borderTop: '1px solid hsl(200, 20%, 80%)' }}>
                      <p css={{ fontSize: '0.8em', marginBottom: 0, color: 'hsl(200, 20%, 50%)' }}>
                        Posted by {post.author ? post.author.userName : 'someone'} on{' '}
                        {format(parseISO(post.posted), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </article>
                </div>
                <Bookmarks post={post}/>

                <Recommends post={post}/>         

                <Comments data={data} />

                <AddComments post={post} />
              </>
            );
          }}
        </Render>
      </div>
    </Layout>
  );
};

PostPage.getInitialProps = ({ query: { slug } }) => ({ slug });

export default PostPage;