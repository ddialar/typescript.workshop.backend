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
      description: 'Bad request error when the sent token belongs to a non recorded user',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error400'
          }
        }
      }
    },
    401: {
      description: 'Unauthorized user error when the provided token is expired or not valid',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error401'
          }
        }
      }
    },
    403: {
      description: 'Forbidden error when the token is not sent',
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
