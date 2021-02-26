export const extendedCommentComponent = {
  ExtendedComment: {
    type: 'object',
    required: ['id', 'body', 'owner'],
    properties: {
      id: {
        type: 'string',
        example: '91739d498840433a8f570029'
      },
      body: {
        type: 'string',
        descriptions: 'Comment content.',
        example: 'Expedita error est voluptas suscipit sed et inventore minima. Voluptate in minus est tenetur nihil consequuntur.'
      },
      owner: {
        $ref: '#/components/schemas/Owner',
        description: 'Post owner data.'
      },
      userIsOwner: {
        type: 'boolean',
        descriptions: 'Indicates whether the user who run the request is the comment owner.'
      },
      createdAt: {
        type: 'string',
        description: 'Creation timestamp in ISO format.',
        example: '2020-11-29T22:29:07.568Z'
      },
      updatedAt: {
        type: 'string',
        description: 'Update timestamp in ISO format.',
        example: '2020-11-29T22:29:07.568Z'
      }
    }
  }
}
