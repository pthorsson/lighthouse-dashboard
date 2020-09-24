const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');

module.exports = (env = {}) => ({
  // Production specific settings
  ...(env.prod && {
    mode: 'production',
  }),

  // Develop specific settings
  ...(!env.prod && {
    mode: 'development',
    devtool: 'source-map',
    watch: true,
  }),

  // Define entry points
  entry: {
    script: ['./src/index.tsx'],
  },

  // Define script outputs
  output: {
    filename: 'static/[name].js',
    path: path.resolve('../.build/client'),
    publicPath: '/',
  },

  // Define loaders and loader options
  module: {
    rules: [
      // TypeScript, TSX
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {},
          },
        ],
      },
      // HTML files
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
    ],
  },

  // Define module resolve settings
  resolve: {
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules'),
      path.resolve('../node_modules'),
    ],
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })],
  },

  // Plugins
  plugins: [
    // General plugins
    new HtmlWebPackPlugin({
      template: 'static/index.html',
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'static/**/*.{ico,svg,png}',
        },
      ],
    }),
    new DotenvPlugin({
      path: '../.env',
    }),
  ],
});
