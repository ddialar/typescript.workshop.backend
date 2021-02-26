export const newRegisteredUserComponent = {
  NewRegisteredUser: {
    type: 'object',
    required: ['username', 'fullName'],
    properties: {
      username: {
        type: 'string',
        description: 'New registered user identification.',
        example: 'mike.mazowski@monsters.com'
      },
      fullName: {
        type: 'string',
        example: 'Mike Wazowski'
      }
    }
  }
}
