const path = require('path')

module.exports = {
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, '../dist')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node'
}
