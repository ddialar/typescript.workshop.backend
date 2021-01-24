export const updateProfile = {
  tags: ['Users'],
  descriptions: 'Update the user\'s profile.',
  operationId: 'updateProfile',
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'New user\'s profile content.',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/NewUserProfileDataInput'
        }
      }
    }
  },
  responses: {
    200: {
      description: 'New user\'s profile data successfully updated',
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
