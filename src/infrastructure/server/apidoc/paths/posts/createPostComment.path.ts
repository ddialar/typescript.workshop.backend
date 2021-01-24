export const createPostComment = {
  tags: ['Posts'],
  descriptions: 'Create a new post comment based on the provided content.',
  operationId: 'createPostComment',
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'New post comment content.',
    required: true,
    content: {
      'application/json': {
        schema: {
          required: ['postId', 'postBody'],
          properties: {
            postId: {
              type: 'string',
              example: '91739d498840433a8f570029'
            },
            postBody: {
              type: 'string',
              example: 'New post comment body.'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'New comment created successfully in the provided post',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Post'
          }
        }
      }
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
