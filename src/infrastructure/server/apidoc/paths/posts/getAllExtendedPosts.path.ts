export const getAllExtendedPosts = {
  tags: ['Posts'],
  descriptions: 'Retrieves all posts in their extended version.',
  operationId: 'getAllExtendedPosts',
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Extended posts retreived successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ExtendedPostArray'
          }
        }
      }
    },
    400: {
      description: `<p>Bad request when some of the next situations happen:</p>
        <ul>
          <li>The token content is malformed</li>
          <li>The token belongs to a non recorded user</li>
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
