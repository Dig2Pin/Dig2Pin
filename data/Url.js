const {
	Text,
	Slug,
	Url,
	DateTime,
	Relationship,
} = require('@keystonejs/fields');

const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce');
const { AuthedRelationship } = require('@keystonejs/fields-authed-relationship');

const {User} = require('./User.js');


const isAdmin = ({ authentication: { item: user } }) => !!user && !!user.isAdmin;

exports.Url = {
	fields:{
		title:{ type: Text },
		slug: { type: Slug, from: 'title' },
		url:{
			type:Url,
			isUnique: true
		},
		description:{ type: Wysiwyg },
		posted: { type: DateTime, defaultValue: new Date( Date.now()).toISOString() },

		author: {
			type: AuthedRelationship,
			ref: 'User',
			isRequired: true,
			access: {
				create: isAdmin,
				update: isAdmin,
			},
		},
	},
	labelResolver: item => `${item.title} <${item.url}>`,
}