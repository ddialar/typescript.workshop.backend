export const getProfile = {
  tags: ['Users'],
  descriptions: 'Retrieves the user\'s profile.',
  operationId: 'getProfile',
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    201: {
      description: 'Selected user\'s profile',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/UserProfile'
          }
        }
      }
    },
    400: {
      description: 'Bad request when the provided token is expired',
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
      description: 'Bad request when the provided token is empty',
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
