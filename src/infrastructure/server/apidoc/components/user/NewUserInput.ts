export const newUserInputComponent = {
  NewUserInput: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        description: 'New user contact email that will be turned into its username.',
        example: 'mike.mazowski@monsters.com'
      },
      password: {
        type: 'string',
        example: '123456'
      },
      name: {
        type: 'string',
        example: 'Mike'
      },
      surname: {
        type: 'string',
        example: 'Wazowski'
      },
      avatar: {
        type: 'string',
        description: 'URL to the avatar location.',
        example: 'https://cdn.icon-icons.com/icons2/1736/PNG/128/4043268-alien-avatar-space-ufo_113272.png'
      }
    }
  }
}
