const path = require("path");

module.exports = {
  entry: {
    build: ["./src/knex"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "build.js",
    library: {
      type: "commonjs2",
    },
  },
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      assert: require.resolve("assert"),
      buffer: require.resolve("buffer"),
      crypto: require.resolve("crypto-browserify"),
      fs: false,
      stream: require.resolve("stream-browserify"),
      timers: require.resolve("timers-browserify"),
      tty: require.resolve("tty-browserify"),
      url: require.resolve("url"),
    },
  },
  module: {
    rules: [
      {
        test: /columncompiler\.js$/,
        loader: "string-replace-loader",
        options: {
          multiple: [
            { search: "/(?<!\\\\)'/g", replace: "/not_supported_regex/g" },
            { search: "/(?<!')'(?!')/g", replace: "/not_supported_regex/g" },
          ],
        },
      },
    ],
  },
};
