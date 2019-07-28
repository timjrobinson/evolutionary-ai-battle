const presets = [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current"
        },
        useBuiltIns: "usage",
      },
    ],
  ];
  
  module.exports = { presets };
  