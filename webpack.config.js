const path = require('path')

module.exports = {
  entry: './src/index.esm.js',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hackex.js',
    library: 'Vuex',
    libraryTarget: 'var'
  }
}
