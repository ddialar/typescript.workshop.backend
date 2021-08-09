/* eslint-disable import/no-extraneous-dependencies */
const NodemonPlugin = require('nodemon-webpack-plugin')
const { merge } = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const path = require('path')
const webpack = require('webpack')
const dotenv = require('dotenv').config({ path: path.join(__dirname, '../env/.env.dev') })
const common = require('./webpack.common.js')

module.exports = merge(common, {
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{ loader: 'ts-loader' }]
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        use: [{ loader: '@graphql-tools/webpack-loader' }]
      }
    ]
  },
  devtool: 'inline-source-map',
  entry: [path.join(__dirname, '../src/app.ts')],
  externals: [nodeExternals()],
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed)
    }),
    new NodemonPlugin({
      watch: path.join(__dirname, '../dist'),
      verbose: true,
      ext: 'ts,js,graphql'
    })
  ],
  watch: true
})
