const path = require("path");
const webpack = require("webpack");

module.exports = {
  //mode: 'production',
  mode: "development",
  context: path.join(__dirname, "src"),
  entry: {
    app: "./app.js",
    test: "./test1.js",
    dropzone: "./dropzone.js"
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  target: "web",
  plugins: [
    // new webpack.ProvidePlugin({
    //     Dropzone: "./dropzone.js",
    //     // ...
    //   })
  ]
};
