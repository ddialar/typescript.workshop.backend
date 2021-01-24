export const ownerComponent = {
  Owner: {
    type: 'object',
    required: ['id', 'name', 'surname'],
    properties: {
      id: {
        type: 'string',
        example: '91739d498840433a8f570029'
      },
      name: {
        type: 'string',
        example: 'Trenton'
      },
      surname: {
        type: 'string',
        example: 'Kutch'
      },
      avatar: {
        type: 'string',
        description: 'URL where the image is stored.',
        example: 'https://cdn.icon-icons.com/icons2/1736/PNG/128/4043253-friday-halloween-jason-movie_113258.png'
      }
    }
  }
}
