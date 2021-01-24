export const newUserProfileDataInputComponent = {
  NewUserProfileDataInput: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'New user\'s name.',
        example: 'John'
      },
      surname: {
        type: 'string',
        description: 'New user\'s surname.',
        example: 'Doe'
      },
      avatar: {
        type: 'string',
        description: 'New user\'s avatar URL.',
        example: 'https://cdn.icon-icons.com/icons2/1736/PNG/128/4043277-avatar-person-pilot-traveller_113245.png'
      }
    }
  }
}
