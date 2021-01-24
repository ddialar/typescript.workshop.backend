export const authenticatedUserComponent = {
  AuthenticatedUser: {
    type: 'object',
    required: ['token'],
    properties: {
      token: {
        type: 'string',
        example: 'JWT string'
      }
    }
  }
}
