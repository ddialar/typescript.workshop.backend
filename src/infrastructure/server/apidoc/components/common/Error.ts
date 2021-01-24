export const errorComponent = {
  Error400: {
    type: 'object',
    required: ['error', 'message'],
    properties: {
      error: {
        type: 'boolean',
        description: 'When this flag is included and it is set to \'true\', it indicates that an error has occurred.',
        example: true
      },
      message: {
        type: 'string',
        description: 'Expanded information about the error.',
        example: 'You have sent someting that is now allowed :('
      }
    }
  },
  Error401: {
    type: 'object',
    required: ['error', 'message'],
    properties: {
      error: {
        type: 'boolean',
        description: 'When this flag is included and it is set to \'true\', it indicates that an error has occurred.',
        example: true
      },
      message: {
        type: 'string',
        description: 'Expanded information about the error',
        example: 'You shall not pass <Gandalf style>'
      }
    }
  },
  Error403: {
    type: 'object',
    required: ['error', 'message'],
    properties: {
      error: {
        type: 'boolean',
        description: 'When this flag is included and it is set to \'true\', it indicates that an error has occurred.',
        example: true
      },
      message: {
        type: 'string',
        description: 'Expanded information about the error.',
        example: 'You forgot to send something important'
      }
    }
  },
  Error404: {
    type: 'object',
    required: ['error', 'message'],
    properties: {
      error: {
        type: 'boolean',
        description: 'When this flag is included and it is set to \'true\', it indicates that an error has occurred.',
        example: true
      },
      message: {
        type: 'string',
        description: 'Expanded information about the error.',
        example: 'You are asking for something that is not here'
      }
    }
  },
  Error500: {
    type: 'object',
    required: ['error', 'message'],
    properties: {
      error: {
        type: 'boolean',
        description: 'When this flag is included and it is set to \'true\', it indicates that an error has occurred.',
        example: true
      },
      message: {
        type: 'string',
        description: 'Expanded information about the error',
        example: 'Internal Server Error'
      }
    }
  }
}
