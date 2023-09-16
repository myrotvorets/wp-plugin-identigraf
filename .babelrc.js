module.exports = function(api) {
  api.cache(() => [process.env.NODE_ENV || 'development'].join(':'));

  return {
    "presets": [
      "@babel/preset-typescript",
      [
        "@babel/env",
        {
          "modules": false,
          "loose": true,
          "bugfixes": true,
          "targets": {
            "esmodules": true,
          }
        }
      ],
    ],
    "plugins": [
      ["@babel/plugin-transform-typescript", { "allowDeclareFields": true }],
      ["@babel/plugin-transform-react-jsx"],
      ["@babel/plugin-transform-class-properties", { "loose": true }],
      ["@babel/plugin-transform-optional-chaining", { "loose": true }],
      ["@babel/plugin-transform-numeric-separator"],
      ["@wordpress/babel-plugin-makepot", { "output": "lang/i8fjs.pot" }],
    ]
  };
}
