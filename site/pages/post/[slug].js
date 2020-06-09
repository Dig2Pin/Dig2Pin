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

const Bookmarks = ({post}) => {

  let [bookmark, setBookmark] = useState('');

  let [pinBookmarkId,setPinBookmarkId] = useState('');

  let [pinBookmarkTitle,setPinBookmarkTitle] = useState('');

  const [createPin, { loading: pinLoading, error: pinError }] = useMutation(ADD_PIN, {
    update: (cache, { data: { createPin } }) => {
      setPinBookmarkId(createPin.bookmark.id);setPinBookmarkTitle(createPin.bookmark.title);
    },
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

  if(!isAuthenticated){return(null)};

  if(pinBookmarkId){return(
    <h2 style={{ marginBottom: 32}}>

          <Link href={`/bookmark/pinned/${pinBookmarkId}`} passHref>
            <a>Pinned in {pinBookmarkTitle}!</a>
          </Link>

    </h2>



    )}

  return(
    <>
      {allPins.length ? (
        <h2 style={{ marginBottom: 32}}>Already pinned in :
          <Link href={`/bookmark/pinned/${allPins[0].bookmark.id}`} passHref>
            <a> [{allPins[0].bookmark.title}]</a>
          </Link>
        </h2>
        ):( <div style={{ marginBottom: 32}}>
              <h2>Slect bookmark to pin</h2>
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
                <select className="form-control" name="bookmarks" value={bookmark} 
                  onChange={event => {
                        setBookmark(event.target.value);
                }} >
                  <option value=""> (select one) </option>
                  {allBookmarks.length
                    ? (
                        allBookmarks.map(bookmark => (
                        <option
                          value={bookmark.id}
                          key={bookmark.id}
                        >
                          {bookmark.title}
                        </option>)
                      )):(<option value="none">No Book Mark</option>)
                  }
                </select>
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
                    marginTop: 6,
                  }}
                />
              </form>
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
              <a href="/signin" as="/signin">
                Sign In
              </a>{' '}
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
                  </Head>
                  <article css={{ padding: '1em' }}>
                  <a href={post.url} css={{textDecoration: 'none'}} target="_blank">
                    <h1 css={{ marginTop: 0 }}>{post.title}</h1>
                    <p css={{ marginTop: 0 }}> 👉 &nbsp; {post.url}</p>
                  </a>
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