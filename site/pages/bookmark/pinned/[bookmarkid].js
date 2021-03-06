import gql from 'graphql-tag';
import { useQuery,useLazyQuery,useMutation } from '@apollo/react-hooks';
import { jsx } from '@emotion/core';
import Layout from '../../../templates/layout';
import Header from '../../../components/header';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/authentication';

const ALL_QUERIES = gql`
  query AllQueries($bookmarkid:ID!) {
      allPins(where:{bookmark:{id:$bookmarkid}},sortBy: created_DESC){
        id
        title
        body
        url{
          slug
        }
        bookmark{
          title
          description
          id
          owner{
            id
          }
        }
      }

      allBookmarks(where:{id:$bookmarkid}){
        owner{
          slug
          userName
        }
      }
  }
`;

const UN_PIN = gql`
  mutation UnPin($id:ID!){
    deletePin(id:$id){
      id
    }
  }
`

const DPin = ({ID}) => {

  const [deletePin, { loading, error }] = useMutation(UN_PIN,{
    refetchQueries: ['AllQueries'],
  });

  if(loading){return(<p></p>)};

  return(<>
          <button
            style={{
              padding: '6px 12px',
              width:'5em',
              fontSize:'1em',
              height:'2em',
              marginTop:'-2.7em',
              marginRight:'-0.5em',
              background: '#29363D',
              color: 'white',
              border: 0,
              float:'right',
              display:'block',
              zIndex:9999
            }}
            onClick={() => {
              deletePin({
                variables: {
                  id:ID,
              }})

            }}
          >
            UnPin
          </button>
          <div style={{clear:'both'}}></div>
  </>)
  
}


const Post = ({ post }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if(isLoading){return(<p>User Loding</p>)};
  return (
    <>
          {isAuthenticated ? (
            (user.id == post.bookmark.owner.id) ? (
              <>
                <style type="text/css" dangerouslySetInnerHTML={{__html: " .postBox { width:calc(100% - 4.6em)}" }} />
              </>
              ):(
              <style type="text/css" dangerouslySetInnerHTML={{__html: " .postBox { width:calc(100%)}" }} />
              )
            ):(
            <style type="text/css" dangerouslySetInnerHTML={{__html: " .postBox { width:calc(100%)}" }} />
            )}
          <article style={{
              padding: '0.25em',
              display: 'block',
              background: 'white',
              marginBottom: '-1em',
              border: '1px solid hsla(200, 20%, 20%, 0.20)',
              }}>
            <div style={{overflow: 'auto',whiteSpace:'nowrap',}} className='postBox'>
              <Link href={`/post/${post.url.slug}`}>
                <a
                target="_blank">
                <div style={{
                  height:'1em',
                  marginBottom:'-2em',
                  marginTop:'0em',
                  display:'inline',
                }}>
                  <p style={{ fontSize:'1em',marginTop: 0, color: '#29363D'}}>{post.title}</p>
                </div>
                </a>
              </Link>
            </div>
            {isAuthenticated ? (
              (user.id == post.bookmark.owner.id) ? (
                <>
                  <DPin ID={post.id}/>
                </>
                ):(null)
              ):(null)}
          </article>
    </>
  );
};



const PinPage = ({bookmarkid}) =>  {

  const {
    data,
    loading,
    error
  } = useQuery(ALL_QUERIES, { variables:{bookmarkid}});

  if(loading){return(<p>Loading</p>)}
  if(error){return(<p>error</p>)}

      return (
        <Layout>
        <Header/>
          <div style={{ margin: '48px 0' }}>
            <Link href={`/bookmark/${data.allBookmarks[0].owner.slug}`} passHref>
              <a style={{ color: 'hsl(200,20%,50%)', cursor: 'pointer' }}>{'< Back to '}{data.allBookmarks[0].owner.userName}' bookmarks</a>
            </Link>
          </div>
          <section style={{ margin: '48px 0' }}>
            {data.allPins.length ? (
              <>
                <h3>Pins in {data.allPins[0].bookmark.title}</h3>
                <p>Description: {data.allPins[0].bookmark.description}</p>
              </>
              ) : (null)
            }  
            {loading ? (
              <p>loading...</p>
            ) : 
            error ? (
              <p>Error!</p>
            ) :
            (
              <div style={{
                    boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)',
              }}>
                {data.allPins.length ? (
                  data.allPins.map(post => <Post post={post} key={post.id}/>)
                ) : (
                  <h3 style={{padding:'20px'}} >No pins to display</h3>
                )}


                <article style={{
                    padding: '0.25em',
                    display: 'block',
                    background: 'white',
                    border: '1px solid hsla(200, 20%, 20%, 0.20)',
                    }}>
                    <div style={{
                      overflow: 'auto',
                      whiteSpace:'nowrap',
                      marginBottom: '-0.8em',
                    }}>
                      <center>
                      <p style={{color: '#29363D'}}>(Lasted One)</p>
                      </center>
                    </div>
                </article>


              </div>
            )}
          </section>
        </Layout>
      );
};

PinPage.getInitialProps = ({ query: { bookmarkid } }) => ({bookmarkid});

export default PinPage;