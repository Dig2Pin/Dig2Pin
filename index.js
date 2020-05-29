require('dotenv').config();

const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { NextApp } = require('@keystonejs/app-next');
const { StaticApp } = require('@keystonejs/app-static');
const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');

const adapterConfig = { mongoUri: process.env.MONGODB_URL };
const initialiseData = require('./data/initial-data');
const { staticRoute, staticPath, distDir } = require('./config');


const keystone = new Keystone({
  name: process.env.PROJECT_NAME,
  adapter: new Adapter(adapterConfig),
  onConnect: initialiseData
});


//import schema start
const {User} = require('./data/User.js');
const {Url} = require('./data/Url.js');
const {Comment} = require('./data/Comment.js');
const {Pin} = require('./data/Pin.js');
const {Bookmark} = require('./data/Bookmark.js');
//import schema end

//create lists
keystone.createList('User', User);
keystone.createList('Url', Url);
keystone.createList('Comment', Comment);
keystone.createList('Pin', Pin);
keystone.createList('Bookmark', Bookmark);

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

const adminApp = new AdminUIApp({
  adminPath: '/admin',
  hooks: require.resolve('./admin/'),
  isAccessAllowed: ({ authentication: { item: user } }) => !!user && !!user.isAdmin,
  authStrategy,
});


module.exports = {
  keystone,
  apps: [

    new GraphQLApp(),
    adminApp,
    new StaticApp({ path: staticRoute, src: staticPath }),
    new NextApp({ dir: 'site' }),
  ],
    distDir,
};



/*
const adminApp = new AdminUIApp({
  adminPath: '/admin',
  authStrategy,
  pages: [
    {
      label: 'Meetup',
      children: ['Event', 'Talk', 'Organiser', 'Sponsor'],
    },
    {
      label: 'People',
      children: ['User', 'Rsvp'],
    },
  ],
});

*/