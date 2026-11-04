const webpack = require('@nativescript/webpack');

module.exports = (env) => {
  webpack.init(env);

  webpack.chainWebpack((config) => {
    // NativeScript resuelve la condición "node" de los exports: jsPDF elegiría
    // su build para Node (usa fs, path, worker_threads). La build ES no los necesita.
    config.resolve.alias.set('jspdf$', require.resolve('jspdf/dist/jspdf.es.min.js'));
  });

  return webpack.resolveConfig();
};
