const {
  Text,
  Slug,
  Password,
  DateTime,
  Checkbox,
  Relationship,
} = require('@keystonejs/fields');

require('dotenv').config();

const { v4: uuid } = require('uuid');

const nodemailer = require("nodemailer");

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
  },
  hooks: {
    afterChange: async ({ updatedItem, existingItem }) => {
      if (existingItem && updatedItem.password !== existingItem.password) {
        const url = process.env.SERVER_URL || 'http://localhost:3000';

        const props = {
          recipientEmail: updatedItem.email,
          signinUrl: `${url}/signin`,
        };

        async function main() {
          let testAccount = await nodemailer.createTestAccount();
          let transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: process.env.SMTP_PORT,
              secure: true, // true for 465, false for other ports
              auth: {
                  user: process.env.SITE_EMAIL_ADDRESS, // generated ethereal user
                  pass: process.env.SITE_EMAIL_PASSWD // generated ethereal password
                },
            });
          
          let info = await transporter.sendMail({
            from: process.env.SITE_EMAIL_USER, 
            to:props.recipientEmail,
            subject: "Your Password has been updated!", 
            html:'<div><p>Hi '+ props.recipientEmail + '</p><div><p>Your password has been updated you can log in <a href=' + props.signinUrl +'>here</a></p></div></div>'
          });
        }
        main().catch(console.error);
      }
    },
  },
  labelResolver: item => `${item.userName} <${item.email}>`,
}

const isAdmin = ({ authentication: { item: user } }) => !!user && !!user.isAdmin;


exports.ForgottenPasswordToken = {
  access: {
    create: true,
    read: true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: {
    user: {
      type: Relationship,
      ref: 'User',
      access: {
        read: isAdmin,
      },
    },
    token: {
      type: Text,
      isRequired: true,
      isUnique: true,
      access: {
        read: isAdmin,
      },
    },
    requestedAt: { type: DateTime, isRequired: true },
    accessedAt: { type: DateTime },
    expiresAt: { type: DateTime, isRequired: true },
  },
  hooks: {
    afterChange: async ({ updatedItem, existingItem, actions: { query } }) => {
      if (existingItem) return null;

      const now = new Date().toISOString();

      const { errors, data } = await query(
        `
        query GetUserAndToken($user: ID!, $now: DateTime!) {
          User( where: { id: $user }) {
            id
            email
          }
          allForgottenPasswordTokens( where: { user: { id: $user }, expiresAt_gte: $now }) {
            token
            expiresAt
          }
        }
      `,
        { skipAccessControl: true, variables: { user: updatedItem.user.toString(), now } }
      );

      if (errors) {
        console.error(errors, `Unable to construct password updated email.`);
        return;
      }

      const { allForgottenPasswordTokens, User } = data;
      const forgotPasswordKey = allForgottenPasswordTokens[0].token;
      const url = process.env.SERVER_URL || 'http://localhost:3000';

      const props = {
        forgotPasswordUrl: `${url}/change-password?key=${forgotPasswordKey}`,
        recipientEmail: User.email,
      };


      //sent mail to who forgoot password

    async function main() {
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      let testAccount = await nodemailer.createTestAccount();

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: true, // true for 465, false for other ports
          auth: {
              user: process.env.SITE_EMAIL_ADDRESS, // generated ethereal user
              pass: process.env.SITE_EMAIL_PASSWD // generated ethereal password
            },
        });
      
      let info = await transporter.sendMail({
        from: process.env.SITE_EMAIL_USER, 
        to:props.recipientEmail,
        subject: "Reset Your Password on Dig2Pin", 
       // text: "Hello world?", 
        html: '<div><p>Hi '+props.recipientEmail+'</p><div><p> We have received your request to reset your password. Please follow the link below to reset your password. </p><ul><li><a href=' + props.forgotPasswordUrl + '> Reset Password </a></li></ul><p>If you didn’t ask for your password to be reset, you can safely ignore this email.</p></div></div></body>',
      });
    }
    main().catch(console.error);

    },
  },
};

exports.customSchema = {
  mutations: [
    {
      schema: 'startPasswordRecovery(email: String!): ForgottenPasswordToken',
      resolver: async (obj, { email }, context, info, { query }) => {
        const token = uuid();

        const tokenExpiration =
          parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRY) || 1000 * 60 * 60 * 24;

        const now = Date.now();
        const requestedAt = new Date(now).toISOString();
        const expiresAt = new Date(now + tokenExpiration).toISOString();

        const { errors: userErrors, data: userData } = await query(
          `
            query findUserByEmail($email: String!) {
              allUsers(where: { email: $email }) {
                id
                email
              }
            }
          `,
          { variables: { email: email }, skipAccessControl: true }
        );

        if (userErrors || !userData.allUsers || !userData.allUsers.length) {
          console.error(
            userErrors,
            `Unable to find user when trying to create forgotten password token.`
          );
          return;
        }

        const userId = userData.allUsers[0].id;

        const result = {
          userId,
          token,
          requestedAt,
          expiresAt,
        };

        const { errors } = await query(
          `
            mutation createForgottenPasswordToken(
              $userId: ID!,
              $token: String,
              $requestedAt: DateTime,
              $expiresAt: DateTime,
            ) {
              createForgottenPasswordToken(data: {
                user: { connect: { id: $userId }},
                token: $token,
                requestedAt: $requestedAt,
                expiresAt: $expiresAt,
              }) {
                id
                token
                user {
                  id
                }
                requestedAt
                expiresAt
              }
            }
          `,
          { variables: result, skipAccessControl: true }
        );

        if (errors) {
          console.error(errors, `Unable to create forgotten password token.`);
          return;
        }

        return true;
      },
    },
    {
      schema: 'changePasswordWithToken(token: String!, password: String!): User',
      resolver: async (obj, { token, password }, context, info, { query }) => {
        const now = Date.now();

        const { errors, data } = await query(
          `
            query findUserFromToken($token: String!, $now: DateTime!) {
              passwordTokens: allForgottenPasswordTokens(where: { token: $token, expiresAt_gte: $now }) {
                id
                token
                user {
                  id
                }
              }
            }
          `,
          { variables: { token, now }, skipAccessControl: true }
        );

        if (errors || !data.passwordTokens || !data.passwordTokens.length) {
          console.error(errors, `Unable to find token`);
          throw errors.message;
        }

        const user = data.passwordTokens[0].user.id;
        const tokenId = data.passwordTokens[0].id;

        const { errors: passwordError } = await query(
          `mutation UpdateUserPassword($user: ID!, $password: String!) {
            updateUser(id: $user, data: { password: $password }) {
              id
            }
          }
        `,
          { variables: { user, password }, skipAccessControl: true }
        );

        if (passwordError) {
          console.error(passwordError, `Unable to change password`);
          throw passwordError.message;
        }

        await query(
          `mutation DeletePasswordToken($tokenId: ID!) {
            deleteForgottenPasswordToken(id: $tokenId) {
              id
            }
          }
        `,
          { variables: { tokenId }, skipAccessControl: true }
        );

        return true;
      },
    },
  ],
};
