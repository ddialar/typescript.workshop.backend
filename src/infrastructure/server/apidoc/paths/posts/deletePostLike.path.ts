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
      description: `<p>Bad request when some of the next situations happen:</p>
        <ul>
          <li>The token content is malformed</li>
          <li>The token belongs to a non recorded user</li>
          <li>The post ID is not provided, empty or malformed</li>
          <li>The request is performed by an user who has not liked the post previously</li>
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
