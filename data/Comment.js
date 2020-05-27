const {
  Text,
  Relationship,
  DateTime,
} = require('@keystonejs/fields');

const { AuthedRelationship } = require('@keystonejs/fields-authed-relationship');

const {Url} = require('./Url.js');
const {User} = require('./User.js');



const isAdmin = ({ authentication: { item: user } }) => !!user && !!user.isAdmin;

exports.Comment = {
  fields: {
    body: { type: Text, isMultiline: true },
    url: {
      type: Relationship,
      ref: 'Url',
    },
    author: {
      type: AuthedRelationship,
      ref: 'User',
      isRequired: true,
      access: {
        create: isAdmin,
        update: isAdmin,
      },
    },
    posted: { type: DateTime },
  },
  labelResolver: item => item.body,
};

