export default {
  pages: () => [
    {
      label: 'Post',
      children: [
        { listKey: 'Url' },
        { listKey: 'Comment' },
      ],
    },
    {
      label: 'People',
      children: ['User'],
    },
  ],
};
