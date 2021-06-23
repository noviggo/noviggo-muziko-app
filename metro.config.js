// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.minifierConfig = {
  keep_classnames: true, // FIX typeorm
  keep_fnames: true, // FIX typeorm
  mangle: {
    keep_classnames: true, // FIX typeorm
    keep_fnames: true, // FIX typeorm
  },
  output: {
    ascii_only: true,
    quote_style: 3,
    wrap_iife: true,
  },
  sourceMap: {
    includeSources: false,
  },
  toplevel: false,
  compress: {
    reduce_funcs: false,
  },
};


module.exports = config;
