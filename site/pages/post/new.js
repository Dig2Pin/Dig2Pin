const removeUrlGarbage = require('link-cleaner');
const normalizeUrl = require('normalize-url');

/** @jsx jsx */
import { jsx } from '@emotion/core';
import Link from 'next/link';

import gql from 'graphql-tag';
import { useMutation, useQuery, useLazyQuery} from '@apollo/react-hooks';
import { useState } from 'react';

import styled from '@emotion/styled';

import Layout from '../../templates/layout';
import { Banner } from '../../components/banner';


const FormGroup = styled.div({
  display: 'flex',
  marginBottom: 8,
  width: '100%',
  maxWidth: 500,
});

const Label = styled.label({
  width: 200,
});

const Input = styled.input({
  width: '100%',
  padding: 8,
  fontSize: '1em',
  borderRadius: 4,
  border: '1px solid hsl(200,20%,70%)',
});

const ADD_URL = gql`
mutation AddUrl($url:String!,$title: String!, $body: String!, $posted: DateTime!) {
  createUrl(data: {url: $url, title: $title, description: $body, posted: $posted}) {
    id
    slug
  }
}
`;

const FIND_URL = gql`
query FindUrl($findUrl:String!) {
  allUrls(where:{url:$findUrl}){
    id
    slug
    title
    description
  }
}
`;

export default () => {
  const [findUrl, setFindUrl] = useState('');
  const [resTitleUrl, setResTitleUrl] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [slug, setSlug] = useState('');




  const { data, loading: userLoading, error: userError } = useQuery(gql`
    query {
      authenticatedUser {
        id
      }
    }
    `);


  const[UrlRespond,{ data:{ allUrls = [] } = {}, called, loading: findLoading, error:findError } ]= useLazyQuery(FIND_URL);


  const [createUrl, { error: saveError, loading: savingPost }] = useMutation(ADD_URL, {
    update: (cache, { data: { createUrl } }) => {
      setSlug(createUrl.slug);
    },
  });


  const loggedIn = !userLoading && !!data.authenticatedUser;
  const formDisabled = !loggedIn || savingPost;

  if (!called) {
    return( 
      <form
      disabled={formDisabled}
      onSubmit={() => {
        UrlRespond({
          variables: {
            findUrl:normalizeUrl(removeUrlGarbage(findUrl.toLowerCase())),
          },
        });
        setUrl(normalizeUrl(removeUrlGarbage(findUrl.toLowerCase())));
      }}
      >
      <FormGroup>
      <Label htmlFor="url">Url:</Label>
      <Input
      disabled={formDisabled}
      type="text"
      name="findUrl"
      value={findUrl}
      onChange={event => {
        setFindUrl(event.target.value);
      }}
      />
      </FormGroup>

      <input type="submit" value="submit"/>
      </form>
      )
  }


  if(findLoading){<p>Loading Finding</p>};


  const error = userError || saveError;

  if(allUrls.length){return(<><p>Title:{allUrls[0].title} </p></>)}

    return (
      <Layout>
      <div css={{ margin: '48px 0' }}>
      <Link href="/" passHref>
      <a css={{ color: 'hsl(200,20%,50%)', cursor: 'pointer' }}>{'< Go Back'}</a>
      </Link>
      <h1>Share an Url</h1>

      {slug && (
        <Banner style="success">
        <strong>Success!</strong> Post has been created.{' '}
        <Link href={`/post/[slug]?slug=${slug}`} as={`/post/${slug}`} passHref>
        <a css={{ color: 'green' }}>Check it out</a>
        </Link>
        </Banner>
        )}

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
          to create a post.
          </Banner>
          )}
        <form
        disabled={formDisabled}
        onSubmit={e => {
          e.preventDefault();
          createUrl({
            variables: {
              url:normalizeUrl(removeUrlGarbage(url.toLowerCase())),
              title,
              body,
              posted: new Date(),
            },
          });
          setUrl('');
          setTitle('');
          setBody('');
        }}
        >
        <FormGroup>
        <Label htmlFor="url">Url:</Label>
        <Input
        disabled={formDisabled}
        readOnly="readonly"
        type="text"
        name="url"
        value={url}
        />
        </FormGroup>
        <FormGroup>
        <Label htmlFor="title">Title:</Label>
        <Input
        disabled={formDisabled}
        type="text"
        name="title"
        value={title}
        onChange={event => {
          setTitle(event.target.value);
        }}
        />
        </FormGroup>
        <FormGroup>
        <Label htmlFor="body">Description:</Label>
        <textarea
        disabled={formDisabled}
        css={{
          width: '100%',
          padding: 8,
          fontSize: '1em',
          borderRadius: 4,
          border: '1px solid hsl(200,20%,70%)',
          height: 200,
          resize: 'none',
        }}
        name="body"
        value={body}
        onChange={event => {
          setBody(event.target.value);
        }}
        />
        </FormGroup>
        <input type="submit" value="submit" disabled={formDisabled} />
        </form>
        </>
        )}
        </div>
        </Layout>
        );
};