export const createPost = {
  tags: ['Posts'],
  descriptions: 'Create a new post based on the provided content.',
  operationId: 'createPost',
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'New post content.',
    required: true,
    content: {
      'application/json': {
        schema: {
          required: ['postBody'],
          properties: {
            postBody: {
              type: 'string',
              example: 'New post body.'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'New posts created successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/NewPost'
          }
        }
      }
    },
    400: {
      description: 'Bad request when the token is expired',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error400'
          }
        }
      }
    },
    401: {
      description: 'Unauthorized user error when the provided token is not valid',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error401'
          }
        }
      }
    },
    403: {
      description: 'The sent token is empty',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error403'
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
