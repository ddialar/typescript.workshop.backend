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
      },
      avatar: {
        type: 'string',
        description: 'URL to the avatar location.',
        example: 'https://cdn.icon-icons.com/icons2/1736/PNG/128/4043268-alien-avatar-space-ufo_113272.png'
      }
    }
  }
}
