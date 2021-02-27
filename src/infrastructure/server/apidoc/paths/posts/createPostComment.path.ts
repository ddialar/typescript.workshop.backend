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
      description: 'Selected post commented successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Post'
          }
        }
      }
    },
    400: {
      description: `<p>Bad request when some of the next situations happen:</p>
        <ul>
          <li>The token content is malformed</li>
          <li>The token belongs to a non recorded user</li>
          <li>The post ID is not provided, empty or malformed</li>
          <li>The comment body is not provided or empty</li>
        </ul>`,
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error400'
          }
        }
      }
    },
    401: {
      description: 'Unauthorized user error when the provided token is expired',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error401'
          }
        }
      }
    },
    403: {
      description: `<p>Forbidden error when some of the next situations happen:</p>
        <ul>
          <li>The <b>Authorization</b> header is not sent</li>
          <li>The token is epmty</li>
        </ul>`,
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error403'
          }
        }
      }
    },
    404: {
      description: 'When the selected post is not found',
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
