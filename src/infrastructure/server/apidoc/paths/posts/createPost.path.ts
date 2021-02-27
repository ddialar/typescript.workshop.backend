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
      description: `<p>Bad request when some of the next situations happend:</p>
        <ul>
          <li>The token content is malformed</li>
          <li>The token belongs to a non recorded user</li>
          <li>The post body is empty</li>
          <li>The post body is not sent</li>
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
          <li>The token is epmty</li>`,
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
