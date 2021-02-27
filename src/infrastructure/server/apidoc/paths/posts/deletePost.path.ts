export const deletePost = {
  tags: ['Posts'],
  descriptions: 'Delete a post.',
  operationId: 'deletePost',
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'The post that we want to delete.',
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
      description: 'The selected post was deleted successfully'
    },
    400: {
      description: `<p>Bad request when some of the next situations happen:</p>
        <ul>
          <li>The token content is malformed</li>
          <li>The token belongs to a non recorded user</li>
          <li>The post ID is not provided, empty or malformed</li>
          <li>The request is performed by an user who is not registered in the database</li>
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
      description: `<p>Unauthorized user error when some of the next situations happen:</p>
        <ul>
          <li>The token is expired</li>
          <li>The token belongs to a user who is not the post owner</li>
        </ul>`,
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
