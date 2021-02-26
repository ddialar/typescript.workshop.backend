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
      description: 'New user created successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/NewRegisteredUser'
          }
        }
      }
    },
    400: {
      description: `<p>Bad request when some of the next reasons happen:</p>
        <ul>
          <li>The user is alredy recorded in the system.</li>
          <li>Some of the required fields is not provided or its content is malformed.</li>
        </ul>`,
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
