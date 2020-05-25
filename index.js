require('dotenv').config();

const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');

const adapterConfig = { mongoUri: process.env.MONGODB_URL };
const initialiseData = require('./data/initial-data');


const keystone = new Keystone({
  name: process.env.PROJECT_NAME,
  adapter: new Adapter(adapterConfig),
  onConnect: initialiseData
});


//import schema start
const {User} = require('./data/schema.js');
//import schema end

//create lists
keystone.createList('User', User);




const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

const adminApp = new AdminUIApp({
  enableDefaultRoute: true,
  isAccessAllowed: ({ authentication: { item: user } }) => !!user && !!user.isAdmin,
  authStrategy,
});


module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    adminApp,
    //new AdminUIApp({ enableDefaultRoute: true }),
  ],
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