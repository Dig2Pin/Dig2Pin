const {
	Text,
	Relationship,
	DateTime,
} = require('@keystonejs/fields');

const { AuthedRelationship } = require('@keystonejs/fields-authed-relationship');

const {User} = require('./User.js');



const isAdmin = ({ authentication: { item: user } }) => !!user && !!user.isAdmin;

exports.Bookmark = {
	fields: {
		title:{ type: Text },
		description: { type: Text },
		owner: {
			type: AuthedRelationship,
			ref: 'User',
			isRequired: true,
			access: {
				create: isAdmin,
				update: isAdmin,
			},
		},
		created: { type: DateTime, defaultValue: new Date(Date.now()).toISOString()},
	},
	labelResolver: item => item.owner,
};

