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
			type: AuthedRelationship,
			ref: 'Bookmark',
			isRequired: true,
			access: {
				create: isAdmin,
				update: isAdmin,
			},
		},
		created: { type: DateTime },
	},
	labelResolver: item => item.bookmark,
};

