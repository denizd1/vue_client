// vue.config.js
const CompressionWebpackPlugin = require("compression-webpack-plugin");

module.exports = {
  transpileDependencies: [
    "vue-apexcharts",
    "apexcharts",
    "@svgdotjs/svg.js",
    "@svgdotjs/svg.select.js",
    "@svgdotjs/svg.draggable.js",
  ],

  chainWebpack: (config) => {
    // 🔹 Görsel optimizasyonu
    config.module
      .rule("images")
      .use("image-webpack-loader")
      .loader("image-webpack-loader")
      .options({
        mozjpeg: { progressive: true, quality: 75 },
        optipng: { enabled: true },
        pngquant: { quality: [0.7, 0.9], speed: 4 },
        gifsicle: { interlaced: false },
        webp: { quality: 75 },
      });
  },

  configureWebpack: {
    plugins: [
      // 🔹 Build sonrası gzip sıkıştırması
      new CompressionWebpackPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
    ],
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: {
        chunks: "all", // lazy-load aktif
      },
    },
  },
};
