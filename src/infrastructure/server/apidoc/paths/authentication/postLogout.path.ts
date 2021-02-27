export const postLogout = {
  tags: ['Authentication'],
  descriptions: 'Closes the connection between the user and the API.',
  operationId: 'logout',
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Logout success'
    },
    400: {
      description: `<p>Bad request error when some of the next situations affect to the sent token:</p>
        <ul>
          <li>Its content is malformed</li>
          <li>It belongs to a non recorded user</li>
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
