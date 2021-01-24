export const createPostLike = {
  tags: ['Posts'],
  descriptions: 'To like a post.',
  operationId: 'createPostLike',
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Post to be liked.',
    required: true,
    content: {
      'application/json': {
        schema: {
          required: ['postId'],
          properties: {
            postId: {
              type: 'string',
              example: '91739d498840433a8f570029'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'New comment created successfully in the provided post'
    },
    400: {
      description: 'Bad request when the token is expired or it belongs to a non registered user',
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
    404: {
      description: 'When the provided post is not found',
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
