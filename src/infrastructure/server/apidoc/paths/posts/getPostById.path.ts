export const getPostById = {
  tags: ['Posts'],
  descriptions: 'Retrieves post specified by the provided ID.',
  operationId: 'getPostById',
  parameters: [
    {
      in: 'path',
      name: 'id',
      description: 'Post ID which we want to retrieve.',
      required: true,
      type: 'string'
    }
  ],
  responses: {
    200: {
      description: 'Post retreived successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Post'
          }
        }
      }
    },
    404: {
      description: 'API Error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error404'
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
