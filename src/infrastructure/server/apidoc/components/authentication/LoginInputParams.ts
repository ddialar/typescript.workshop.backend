export const loginInputParamsComponent = {
  LoginInputParams: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string',
        example: 'trenton.kutch@mail.com'
      },
      password: {
        type: 'string',
        example: '123456'
      }
    }
  }
}
