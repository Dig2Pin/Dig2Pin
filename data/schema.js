require('dotenv').config();
const {
  Text,
  Slug,
  Password,
  DateTime,
  Checkbox,
} = require('@keystonejs/fields');

//const dev = process.env.NODE_ENV !== 'production';




exports.User = {
  fields:{
    userName:{ type: Text, isUnique: true},
    slug: { type: Slug, from: 'userName' },
    familyName:{ type: Text},
    secondName:{type: Text},
    email: { type: Text, isUnique: true},
    password: { type: Password },

    isAdmin: { type: Checkbox },
    joined: { type: DateTime, defaultValue: new Date(Date.now()).toISOString()},
  }
}