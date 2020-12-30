// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="webpack-filter-warnings-plugin.d.ts" />

import ForkTSCheckerPlugin from 'fork-ts-checker-webpack-plugin';
import { resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { BannerPlugin, Configuration, ProgressPlugin } from 'webpack';
import FilterWarningsPlugin from 'webpack-filter-warnings-plugin';
import nodeExternals from 'webpack-node-externals';

const devMode = process.env.NODE_ENV !== 'production';

export default <Configuration>{
  mode: devMode ? 'development' : 'production',
  entry: resolve(__dirname, 'src/index.ts'),
  output: {
    filename: 'tplink-dbus.js',
    path: resolve(__dirname, 'build'),
    libraryTarget: 'commonjs',
  },
  optimization: {
    minimize: !devMode,
    minimizer: [new TerserPlugin()],
  },
  target: 'node',
  devtool: 'source-map',
  resolve: { extensions: ['.ts', '.js'] },
  externalsPresets: { node: true },
  externals: devMode ? [nodeExternals()] : undefined,
  plugins: [
    new ForkTSCheckerPlugin(),
    new ProgressPlugin({}),
    new FilterWarningsPlugin({
      exclude: [
        /Module not found: Error: Can't resolve 'x11' in '.*dbus-next\/lib'/,
        /Critical dependency:/,
      ],
    }),
    new BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
  ],
  module: { rules: [{ test: /\.ts$/, loader: 'babel-loader' }] },
};
