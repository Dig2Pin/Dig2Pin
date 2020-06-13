const {
	Text,
	Relationship,
	DateTime,
} = require('@keystonejs/fields');

const { AuthedRelationship } = require('@keystonejs/fields-authed-relationship');

const {Url} = require('./Url.js');
const {User} = require('./User.js');
const {Bookmark} = require('./Bookmark.js');



const isAdmin = ({ authentication: { item: user } }) => !!user && !!user.isAdmin;

exports.Pin = {
	fields: {
		title:{ type: Text },
		body: { type: Text, isMultiline: true },
		url: {
			type: Relationship,
			ref: 'Url',
		},
		bookmark: {
			type: Relationship,
			ref: 'Bookmark',
			isRequired: true,
		},
		created: { type: DateTime, defaultValue: new Date(Date.now()).toISOString() },
	},
	labelResolver: item => item.bookmark,
};

