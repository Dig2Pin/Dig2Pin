import gql from 'graphql-tag';
import { useQuery,useLazyQuery } from '@apollo/react-hooks';
import { jsx } from '@emotion/core';
import Layout from '../../templates/layout';
import Link from 'next/link';

const GET_PINS = gql`
  query GetPins($userslug:String!) {
      allPins(where:{bookmark:{owner:{slug:$userslug}}}){
        title
        body
        url{
          slug
        }
        bookmark{
          title
          id
        }
      }
  }
`;


const Post = ({ post }) => {
  return (
    <Link href={`/post/${post.url.slug}`}>
      <a style={{
          display: 'block',
          background: 'white',
          marginBottom: -1,
          border: '1px solid hsla(200, 20%, 20%, 0.20)'
      }}>
        <article style={{ padding: '1em' }}>
          <h3 style={{ marginTop: 0, color: '#29363D',}}>{post.title}</h3>
        </article>
      </a>
    </Link>
  );
};



const PinPage = ({userslug}) =>  {

  const {
    data :{allPins = [] } = {},
    loading,
    error
  } = useQuery(GET_PINS, { variables:{userslug}});


      return (
        <Layout>
          <section style={{ margin: '48px 0' }}>
            <h2>Pins</h2>
            {allPins.length ? (
              <h2>{allPins[0].bookmark.title}</h2>
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
              </div>
            )}
          </section>
        </Layout>
      );
};

PinPage.getInitialProps = ({ query: { userslug } }) => ({userslug});

export default PinPage;