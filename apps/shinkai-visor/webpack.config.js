const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const _ = require('lodash');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  const extendedConfig = {
    output: { path: config.output.path, filename: "[name].js" },
  };
  return _.merge(config, extendedConfig);
});
