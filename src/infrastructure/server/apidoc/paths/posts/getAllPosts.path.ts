export const getAllPosts = {
  tags: ['Posts'],
  descriptions: 'Retrieves the whole persisted posts.',
  operationId: 'getAllPosts',
  responses: {
    200: {
      description: 'Posts retreived successfully or empty array when no posts are found',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/PostArray'
          }
        }
      }
    },
    500: {
      description: 'API Error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error500'
          }
        }
      }
    }
  }
}
