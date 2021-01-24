export const signin = {
  tags: ['Users'],
  descriptions: 'Create a new user.',
  operationId: 'signin',
  requestBody: {
    description: 'New user content.',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/NewUserInput'
        }
      }
    }
  },
  responses: {
    201: {
      description: 'New user created successfully'
    },
    400: {
      description: 'Bad request when the user is alredy recorded in the system',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error400'
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
