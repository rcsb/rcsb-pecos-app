module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: '3.0.0'
      }
    ],
    '@babel/react',
    {
      plugins: ['@babel/plugin-proposal-class-properties']
    }
  ]
}
