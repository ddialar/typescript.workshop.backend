export const deletePostLike = {
  tags: ['Posts'],
  descriptions: 'Delete a post like.',
  operationId: 'deletePostLike',
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'The post which like we want to remove.',
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
      description: 'The selected like was removed successfully in the provided post',
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
      description: 'Unauthorized user error when the provided token is not valid or when the user who performes the action is not the comment owner',
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
      description: 'When the provided post was not found',
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
