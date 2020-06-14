import gql from 'graphql-tag';
import { useQuery,useLazyQuery,useMutation } from '@apollo/react-hooks';
import { jsx } from '@emotion/core';
import Layout from '../../../templates/layout';
import Header from '../../../components/header';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/authentication';

const GET_PINS = gql`
  query GetPins($bookmarkid:ID!) {
      allPins(where:{bookmark:{id:$bookmarkid}}){
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
    refetchQueries: ['GetPins'],
  });

  if(loading){return(<p></p>)};

  return(<>
          <button
            style={{
              padding: '6px 12px',
              width:'30%',
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
          <article style={{
              padding: '0.25em',
              display: 'block',
              background: 'white',
              marginBottom: '-1em',
              border: '1px solid hsla(200, 20%, 20%, 0.20)',
              overflow: 'hidden'
              }}>
            <Link href={`/post/${post.url.slug}`}>
              <a
              target="_blank">
              <div style={{
                height:'1em',
                marginBottom:'-2em',
                marginTop:'0em',
                overflow: 'hidden',
                whiteSpace:'nowrap',
                display:'inline'
              }}>
                <p style={{ fontSize:'1em',marginTop: 0, color: '#29363D'}}>{post.title}</p>
              </div>
              </a>
            </Link>
            {isAuthenticated ? (
              (user.id == post.bookmark.owner.id) ? (
                <>
                  <DPin ID={post.id}/>
                </>
                ):(null)
              ):(null)}
          </article>
  );
};



const PinPage = ({bookmarkid}) =>  {

  const {
    data :{allPins = [] } = {},
    loading,
    error
  } = useQuery(GET_PINS, { variables:{bookmarkid}});


      return (
        <Layout>
        <Header/>
          <section style={{ margin: '48px 0' }}>
            {allPins.length ? (
              <>
                <h3>Pins in {allPins[0].bookmark.title}</h3>
                <p>Description: {allPins[0].bookmark.description}</p>
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
                {allPins.length ? (
                  allPins.map(post => <Post post={post} key={post.id}/>)
                ) : (
                  <h3 style={{padding:'20px'}} >No pins to display</h3>
                )}


                <article style={{
                    padding: '0.25em',
                    display: 'block',
                    background: 'white',
                    border: '1px solid hsla(200, 20%, 20%, 0.20)',
                    overflow: 'hidden'
                    }}>
                    <div style={{
                      overflow: 'hidden',
                      whiteSpace:'nowrap',
                      marginBottom: '-0.8em',
                    }}>
                      <center>
                      <p style={{color: '#29363D'}}>(Latest One)</p>
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