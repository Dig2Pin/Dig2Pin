import React from 'react';
import Head from 'next/head';
import gql from 'graphql-tag';
import { ApolloProvider } from '@apollo/react-hooks';
import { ToastProvider } from 'react-toast-notifications';
import withApollo from '../lib/withApollo';
import { AuthProvider } from '../lib/authentication';


const MyApp = ({ Component, pageProps, apolloClient, user }) => {
  return (
    <ToastProvider>
      <ApolloProvider client={apolloClient}>
        <AuthProvider initialUserValue={user}>
          <Head>
            <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8"/>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
            />
            <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" />
          </Head>
          <Component {...pageProps} />
        </AuthProvider>
      </ApolloProvider>
    </ToastProvider>
  );
};

MyApp.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};

  const data = await ctx.apolloClient.query({
    query: gql`
      query {
        authenticatedUser {
          id
          slug
          userName
          isAdmin
        }
      }
    `,
    fetchPolicy: 'network-only',
  });

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return { pageProps, user: data.data ? data.data.authenticatedUser : undefined };
};

export default withApollo(MyApp);