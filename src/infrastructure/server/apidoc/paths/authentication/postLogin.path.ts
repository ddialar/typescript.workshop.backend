export const postLogin = {
  tags: ['Authentication'],
  descriptions: 'Returns the authorization parameters that identify the user against the API.',
  operationId: 'login',
  requestBody: {
    description: 'User identification parameters',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/LoginInputParams'
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Authentication success',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/AuthenticatedUser'
          }
        }
      }
    },
    400: {
      description: 'Bad request when some of the required fields is not provided or its contend is malformed',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error400'
          }
        }
      }
    },
    401: {
      description: 'Unauthorized user error when the username or password are wrong or they mismatch with the stored information',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error401'
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
