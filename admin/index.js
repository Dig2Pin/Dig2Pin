export default {
  pages: () => [
    {
      label: 'Url',
      children: ['Url'],
    },
    {
      label: 'Pin',
      children: ['Pin' ,'Bookmark','Comment'],
    },
    {
      label: 'People',
      children: ['User','ForgottenPasswordToken'],
    },
  ],
};
