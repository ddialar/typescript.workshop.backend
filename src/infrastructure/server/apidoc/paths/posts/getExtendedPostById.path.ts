export const getExtendedPostById = {
  tags: ['Posts'],
  descriptions: 'Retrieves post specified by the provided ID, in its extended version.',
  operationId: 'getExtendedPostById',
  security: [
    {
      Bearer: []
    }
  ],
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
      description: 'Extended post retreived successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ExtendedPost'
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
