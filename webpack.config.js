// webpack.config.js
const path = require('path');

module.exports = {
   module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // Add font loader for MapLibre
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      },
      // Add image loader for MapLibre
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      }
    ]
  },
  entry: {
   autocomplete :   './app/assets/javascripts/version_6/components/accessible-autocomplete.js',
   autocomplete_p :   './app/assets/javascripts/dataselector/components/accessible-autocomplete-p.js',
   autocomplete_v7 :   './app/assets/javascripts/version_7/components/accessible-autocomplete.js',
   autocomplete_pv7 :   './app/assets/javascripts/version_7/components/accessible-autocomplete-p-v7.js',
   autocomplete_pv8 :   './app/assets/javascripts/version_8/components/accessible-autocomplete-p-v8.js',

   // Data selector mvp
   autocomplete_pv_mvp :   './app/assets/javascripts/data-select-mvp/accessible-autocomplete-p-mvp.js',
   autocomplete_la_mvp :   './app/assets/javascripts/data-select-mvp/accessible-autocomplete.js',

   // Version 11
   autocomplete_p_11 :   './app/assets/javascripts/version_11/components/accessible-autocomplete-p-v8.js',
   autocomplete_la_11 :   './app/assets/javascripts/version_11/components/accessible-autocomplete.js',

    // Air Quality Map V11
    AQ_map : './app/assets/javascripts/version_11/air-quality-map.js',

      // Version 12
      autocomplete_p_12 :   './app/assets/javascripts/version_12/components/accessible-autocomplete-p-v8.js',
      autocomplete_la_12 :   './app/assets/javascripts/version_12/components/accessible-autocomplete.js',

      // Air Quality Map V12
      AQ_map_12 : './app/assets/javascripts/version_12/air-quality-map.js',

      // Version 13
      autocomplete_p_13 :   './app/assets/javascripts/version_13/components/accessible-autocomplete-p-v8.js',
      autocomplete_la_13 :   './app/assets/javascripts/version_13/components/accessible-autocomplete.js',

      // Air Quality Map V13
      AQ_map_13 : './app/assets/javascripts/version_13/air-quality-map.js',

      // Version 14
      autocomplete_p_14 :   './app/assets/javascripts/version_14/components/accessible-autocomplete-p-v8.js',
      autocomplete_la_14 :   './app/assets/javascripts/version_14/components/accessible-autocomplete.js',

      // Air Quality Map V14
      AQ_map_14 : './app/assets/javascripts/version_14/air-quality-map.js',

      // Version 15
      autocomplete_p_15 :   './app/assets/javascripts/version_15/components/accessible-autocomplete-p-v8.js',
      autocomplete_la_15 :   './app/assets/javascripts/version_15/components/accessible-autocomplete.js',

      // Air Quality Map V15
      AQ_map_15 : './app/assets/javascripts/version_15/air-quality-map.js',

      // Forecast Map V15
      forecast_map_15 : './app/assets/javascripts/version_15/forecast-map.js',

      // Version 16
      autocomplete_p_16 :   './app/assets/javascripts/version_16/components/accessible-autocomplete-p-v8.js',
      autocomplete_la_16 :   './app/assets/javascripts/version_16/components/accessible-autocomplete.js',

      // Air Quality Map V16
      AQ_map_16 : './app/assets/javascripts/version_16/air-quality-map.js',

      // Forecast Map V16
      forecast_map_16 : './app/assets/javascripts/version_16/forecast-map.js',

      // Management Areas Map V16
      management_areas_map_16 : './app/assets/javascripts/version_16/management-areas-map.js',

      // Version 17
      autocomplete_p_17 :   './app/assets/javascripts/version_17/components/accessible-autocomplete-p-v8.js',
      autocomplete_la_17 :   './app/assets/javascripts/version_17/components/accessible-autocomplete.js',

      // Air Quality Map V17
      AQ_map_17 : './app/assets/javascripts/version_17/air-quality-map.js',

      // Forecast Map V17
      forecast_map_17 : './app/assets/javascripts/version_17/forecast-map.js',

      // Phase 1 Map
      autocomplete_p_phase1_map :   './app/assets/javascripts/phase1_map/components/accessible-autocomplete-p-v8.js',
      autocomplete_la_phase1_map :   './app/assets/javascripts/phase1_map/components/accessible-autocomplete.js',

      // Air Quality Map Phase 1 Map
      AQ_map_phase1_map : './app/assets/javascripts/phase1_map/air-quality-map.js',

      // Forecast Map Phase 1 Map
      forecast_map_phase1_map : './app/assets/javascripts/phase1_map/forecast-map.js'
   },
    // Adjust if your entry file has a different path
  output: {
    path: __dirname,
    filename: './app/assets/javascripts/bundles/[name].bundle.js'
  },
  mode: 'development', // Use 'production' for optimized builds
};
